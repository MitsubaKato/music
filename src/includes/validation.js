import {
  Form as VeeForm,
  Field as VeeField,
  defineRule,
  ErrorMessage,
  configure,
} from "vee-validate";
import {
  required,
  min,
  max,
  alpha_spaces as alphaSpaces,
  email,
  min_value as minVal,
  max_value as maxVal,
  confirmed,
  not_one_of as excluded,
} from "@vee-validate/rules";
import i18n  from "./i18n";



export default {
  install(app) {
    app.component("VeeForm", VeeForm);
    app.component("VeeField", VeeField);
    app.component("ErrorMessage", ErrorMessage);

    defineRule("required", required);
    defineRule("min", min);
    defineRule("max", max);
    defineRule("alpha_spaces", alphaSpaces);
    defineRule("email", email);
    defineRule("min_value", minVal);
    defineRule("max_value", maxVal);
    defineRule("passwords_mismatch", confirmed);
    defineRule("excluded", excluded);

    // configure({
    //   generateMessage: (ctx) => {
    //     const messages = {
    //       required: `The field ${ctx.field} is required.`,
    //       min: `The field ${ctx.field} is too short.`,
    //       max: `The field ${ctx.field} is too long.`,
    //       alpha_spaces: `The field ${ctx.field} may only contain alphabetical characters and spaces.`,
    //       email: `The field ${ctx.field} must be a valid email.`,
    //       min_value: `The field ${ctx.field} is too low.`,
    //       max_value: `The field ${ctx.field} is too high.`,
    //       excluded: `You are not allowed to use this value for the field ${ctx.field}.`,
    //       passwords_mismatch: "The passwords don't match.",
    //     };

    //     const message = messages[ctx.rule.name]
    //       ? messages[ctx.rule.name]
    //       : `The field ${ctx.field} is invalid.`;

    //     return message;
    //   },
    //   validateOnBlur: true,
    //   validateOnChange: true,
    //   validateOnInput: false,
    //   validateOnModelUpdate: true,
    // });

    const generateMessage = (ctx) => {
      const translatedFieldName = i18n.global.t(`fieldNames.${ctx.field}`);
      const messages = {
        required: i18n.global.t('messages.required', { field: translatedFieldName }),
        min: i18n.global.t('messages.min', { field: translatedFieldName }),
        max: i18n.global.t('messages.max', { field: translatedFieldName }),
        alpha_spaces: i18n.global.t('messages.alpha_spaces', { field: translatedFieldName }),
        email: i18n.global.t('messages.email', { field: translatedFieldName }),
        min_value: i18n.global.t('messages.min_value', { field: translatedFieldName }),
        max_value: i18n.global.t('messages.max_value', { field: translatedFieldName }),
        excluded: i18n.global.t('messages.excluded', { field: translatedFieldName }),
        passwords_mismatch: i18n.global.t('messages.passwords_mismatch'),
      };
        
      const message = messages[ctx.rule.name]
        ? messages[ctx.rule.name]
        : i18n.global.t('messages.invalid_field', { field: translatedFieldName });
        
      return message;
    };
    

    configure({
      generateMessage: generateMessage,
      validateOnBlur: true,
      validateOnChange: true,
      validateOnInput: false,
      validateOnModelUpdate: true,
    });
  },
};
