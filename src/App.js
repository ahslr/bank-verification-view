import React, { Component } from "react";
import { connect } from "react-redux";
import { reduxForm, SubmissionError } from "redux-form";
import { IconTitle, Button, HeaderSection } from "components";
import axios from "axios";

import "./App.css";

import renderFields from "./components/Form/factoryFields";

const FORM_NAME = "BankVerification";

const maxLength = (length, message) => (value = "") =>
  value.length > length ? message : undefined;

const required = value => (!value ? "required" : undefined);

class BankVerification extends Component {
  state = {
    formFields: {}
  };

  componentDidMount() {
    const {
      router: {
        location: { query: { type } = {} }
      }
    } = this.props;

    this.generateFormFields();
    this.updatePath('initial_bank_tab', type);
  }

  componentDidUpdate(prevProps) {
    const {
      bankMeta,
      router: {
        location: { query: { type } = {} }
      }
    } = this.props;

    if (
      JSON.stringify(prevProps.bankMeta) !== JSON.stringify(bankMeta) ||
      type !== prevProps.router.location.query.type
    ) {
      this.generateFormFields();
      this.updatePath('initial_bank_tab', type);
    }
  }

  updatePath = (key, value) => {
    const {
      router,
      router: {
        location: { pathname, query = {} }
      }
    } = this.props;
    router.push({ pathname, query: { ...query, [key]: value } });
  };

  generateFormFields = () => {
    const {
      strings: STRINGS = {},
      bankMeta = {},
      router: {
        location: { query: { type } = {} }
      }
    } = this.props;
    const formFields = {};

    if (type === "bank") {
      if (bankMeta.public_meta && Object.keys(bankMeta.public_meta).length) {
        let publicMeta = Object.keys(bankMeta.public_meta);
        publicMeta.forEach(key => {
          const metaData = bankMeta.public_meta[key];
          if (typeof metaData === "object") {
            let text = key;
            if (key.includes("_")) {
              text = key.replace(/_/g, " ");
              text = text.split(" ");
              text =
                text[0].replace(/^./, function (str) {
                  return str.toUpperCase();
                }) +
                " " +
                text[1].replace(/^./, function (str) {
                  return str.toUpperCase();
                });
            } else {
              text = text.replace(/^./, function (str) {
                return str.toUpperCase();
              });
            }
            if (metaData.value) {
              formFields[key] = {
                type: "text",
                label: text,
                placeholder: text,
                fullWidth: true,
                ishorizontalfield: true
              };
              if (metaData.required) {
                formFields[key].validate = [required];
              }
            }
          } else {
            formFields[key] = {
              type: "text",
              label: key,
              placeholder: key,
              fullWidth: true,
              ishorizontalfield: true
            };
          }
        });
      } else {
        formFields.bank_name = {
          type: "text",
          stringId:
            "USER_VERIFICATION.BANK_ACCOUNT_FORM.FORM_FIELDS.BANK_NAME_LABEL,USER_VERIFICATION.BANK_ACCOUNT_FORM.FORM_FIELDS.BANK_NAME_PLACEHOLDER",
          label:
            STRINGS[
              "USER_VERIFICATION.BANK_ACCOUNT_FORM.FORM_FIELDS.BANK_NAME_LABEL"
            ],
          placeholder:
            STRINGS[
              "USER_VERIFICATION.BANK_ACCOUNT_FORM.FORM_FIELDS.BANK_NAME_PLACEHOLDER"
            ],
          validate: [required],
          fullWidth: true,
          ishorizontalfield: true
        };
        formFields.account_number = {
          type: "text",
          stringId:
            "USER_VERIFICATION.BANK_ACCOUNT_FORM.FORM_FIELDS.ACCOUNT_NUMBER_LABEL,USER_VERIFICATION.BANK_ACCOUNT_FORM.FORM_FIELDS.ACCOUNT_NUMBER_PLACEHOLDER,USER_VERIFICATION.BANK_ACCOUNT_FORM.VALIDATIONS.ACCOUNT_NUMBER_MAX_LENGTH",
          label:
            STRINGS[
              "USER_VERIFICATION.BANK_ACCOUNT_FORM.FORM_FIELDS.ACCOUNT_NUMBER_LABEL"
            ],
          placeholder:
            STRINGS[
              "USER_VERIFICATION.BANK_ACCOUNT_FORM.FORM_FIELDS.ACCOUNT_NUMBER_PLACEHOLDER"
            ],
          validate: [
            required,
            maxLength(
              50,
              STRINGS[
                "USER_VERIFICATION.BANK_ACCOUNT_FORM.VALIDATIONS.ACCOUNT_NUMBER_MAX_LENGTH"
              ]
            )
          ],
          maxLength: 50,
          fullWidth: true,
          ishorizontalfield: true
        };
      }
    } else if (type === "osko") {
      formFields.pay_id_email = {
        type: "text",
        label: "Osko account name (Pay ID account name)",
        placeholder: "Account name",
        validate: [required],
        fullWidth: true,
        ishorizontalfield: true
      };
      formFields.pay_id_account_name = {
        type: "text",
        label: "Email",
        placeholder: "Email",
        validate: [required],
        fullWidth: true,
        ishorizontalfield: true
      };
    }

    this.setState({ formFields });
  };

  verifyBankData = data => {
    const {
      verifyBankData = () => {},
      token,
      plugin_url: PLUGIN_URL,
      router: {
        location: { query: { type } = {} }
      }
    } = this.props;

    if (type === "osko") {
      return axios({
        url: `${PLUGIN_URL}/plugins/aussie-bank/user`,
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        },
        data: {
          ...data,
          bank_name: "pay id"
        }
      });
    } else {
      return verifyBankData(data);
    }
  };

  handleSubmit = ({ ...rest }) => {
    return this.verifyBankData(rest)
      .then(({ data }) => {
        this.props.moveToNextStep("bank", {
          bank_data: data
        });
        this.props.setActivePageContent("email");
      })
      .catch(err => {
        const error = { _error: err.message };
        if (err.response && err.response.data) {
          error._error = err.response.data.message;
        }
        throw new SubmissionError(error);
      });
  };

  onGoBack = () => {
    this.props.setActivePageContent("email");
    this.props.handleBack("bank");
  };

  render() {
    const {
      handleSubmit,
      pristine,
      submitting,
      valid,
      error,
      openContactForm,
      icon,
      iconId,
      strings: STRINGS = {},
      icons: ICONS = {},
      getErrorLocalized = () => {}
    } = this.props;
    const { formFields } = this.state;
    return (
      <div className="presentation_container apply_rtl verification_container">
        <IconTitle
          stringId="USER_VERIFICATION.BANK_VERIFICATION"
          text={STRINGS["USER_VERIFICATION.BANK_VERIFICATION"]}
          textType="title"
        />
        <form className="d-flex flex-column w-100 verification_content-form-wrapper">
          <div className="verification-form-panel mt-3 mb-5">
            <HeaderSection
              stringId="USER_VERIFICATION.TITLE_BANK_ACCOUNT"
              title={STRINGS["USER_VERIFICATION.TITLE_BANK_ACCOUNT"]}
              openContactForm={openContactForm}
              strings={STRINGS}
              icons={ICONS}
            >
              <div className="my-2">
                {STRINGS["USER_VERIFICATION.BANK_VERIFICATION_TEXT_1"]}
              </div>
              <div className="my-2">
                {STRINGS["USER_VERIFICATION.BANK_VERIFICATION_TEXT_2"]}
              </div>
              <ul className="pl-4">
                <li className="my-1">
                  {STRINGS["USER_VERIFICATION.BASE_WITHDRAWAL"]}
                </li>
                <li className="my-1">
                  {STRINGS["USER_VERIFICATION.BASE_DEPOSITS"]}
                </li>
                <li className="my-1">
                  {STRINGS["USER_VERIFICATION.WARNING.LIST_ITEM_3"]}
                </li>
              </ul>
            </HeaderSection>
            {renderFields(formFields)}
            {error && (
              <div className="warning_text">{getErrorLocalized(error)}</div>
            )}
          </div>
          <div className="d-flex justify-content-center align-items-center mt-2">
            <div className="f-1 d-flex justify-content-end verification-buttons-wrapper">
              <Button
                label={STRINGS["USER_VERIFICATION.GO_BACK"]}
                onClick={this.onGoBack}
              />
            </div>
            <div className="separator" />
            <div className="f-1 verification-buttons-wrapper">
              <Button
                label={STRINGS["SUBMIT"]}
                type="button"
                onClick={handleSubmit(this.handleSubmit)}
                disabled={pristine || submitting || !valid || !!error}
              />
            </div>
          </div>
        </form>
      </div>
    );
  }
}

const BankVerificationForm = reduxForm({
  form: FORM_NAME
})(BankVerification);

const mapStateToProps = () => {
  const values = {};
  return values;
};

export default connect(mapStateToProps)(BankVerificationForm);
