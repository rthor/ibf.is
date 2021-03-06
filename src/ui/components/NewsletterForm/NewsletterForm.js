import React, { Component, createRef } from "react";
import cn from "classnames";
import styles from "./NewsletterForm.module.scss";
import { H2, Body3 } from "src/ui/components/Typography";
import SubmitArrow from "src/ui/components/SubmitArrow";
import { validateEmail } from "src/utility/helpers/validateEmail";
import { withLang } from "src/utility/Translation";
import TranslationContext from "src/utility/TranslationContext";

const noop = () => {};

class NewsletterForm extends Component {
  static contextType = TranslationContext;
  constructor(props) {
    super(props);
    this.handleFocus = this.handleFocus.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.inputRef = createRef();
    this.state = {
      isSubmitted: false,
      showError: false,
    };
  }

  handleFocus() {
    this.inputRef.current.focus();
  }

  async handleSubmit(event, onSubmit) {
    const { isSubmitted } = this.state;
    const value = this.inputRef.current.value;

    event.preventDefault();

    const isValidEmail = validateEmail(value);

    const fail = () => {
      this.setState({
        showError: true,
      });
    };

    if (!isValidEmail) {
      return fail();
    }

    const rawResponse = await fetch("https://v2.ibf.is/api/newsletter", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: value, language: this.context }),
    });
    const { success } = await rawResponse.json();

    if (!success) {
      fail();
    }

    this.setState(
      {
        isSubmitted: !isSubmitted,
      },
      () => onSubmit()
    );
  }

  render() {
    const { placeholder, onSubmit = noop, inHero } = this.props;
    const { isSubmitted, showError } = this.state;

    const T = withLang(this.context);

    return isSubmitted ? (
      <div className={styles.thanks}>{T("newsletterThanks")}</div>
    ) : (
      <>
        <form
          onSubmit={event => this.handleSubmit(event, onSubmit)}
          className={cn(styles.root, inHero && styles.inHero)}
        >
          <div
            className={cn(styles.inputWrap, showError && styles.error)}
            onClick={this.handleFocus}
          >
            <input
              ref={this.inputRef}
              className={styles.input}
              placeholder={placeholder}
            />
          </div>
          <button className={styles.submit} type="submit">
            <H2 className={styles.submitText}>{T("join")}</H2>
            <SubmitArrow className={styles.submitArrow} />
          </button>
        </form>
        <Body3 className={styles.fineprint} light bottom="large">
          {T("newsletterDescription")}
        </Body3>
      </>
    );
  }
}

export default NewsletterForm;
