/**
 * Code taken from "@microsoft/fast-components-styles-msft"
 * Modified to fit the custom design
 */
import { ButtonClassNameContract } from "@microsoft/fast-components-class-name-contracts-msft";
import {
  ComponentStyles,
  CSSRules,
  mergeDesignSystem,
} from "@microsoft/fast-jss-manager";
import { directionSwitch, format } from "@microsoft/fast-jss-utilities";
import {
  DesignSystem,
  accentForegroundCut,
  glyphSize,
  horizontalSpacing,
  focusOutlineWidth,
  accentPalette,
} from "@microsoft/fast-components-styles-msft";
import { getSwatch } from "@microsoft/fast-components-styles-msft/dist/utilities/color/palette";
import { ButtonStyles as MSFTStyle } from "@microsoft/fast-components-styles-msft";

const applyAccentBackground: CSSRules<DesignSystem> = {
  background: ds => getSwatch(45, accentPalette(ds)),
};

const applyPrimaryShadow = (shadowSize: string): CSSRules<DesignSystem> => {
  return {
    "box-shadow": format(
      "0 {0} 0 0 {1}",
      () => shadowSize,
      ds => getSwatch(65, accentPalette(ds))
    ),
  };
};

const applyBeforeMargin: CSSRules<DesignSystem> = {
  "margin-right": directionSwitch(horizontalSpacing(4), ""),
  "margin-left": directionSwitch("", horizontalSpacing(4)),
};

const styles: ComponentStyles<ButtonClassNameContract, DesignSystem> = {
  button: {
    padding: format("6px {0}", horizontalSpacing(focusOutlineWidth)),
  },
  button__primary: {
    fill: accentForegroundCut,
    color: accentForegroundCut,
    ...applyAccentBackground,
    ...applyPrimaryShadow("4px"),
    "font-weight": "bold",
    "margin-bottom": "4px",
    overflow: "visible",
    position: "relative",

    // Additional spacing to avoid clipping
    "&::before": {
      transition: "inherit",
      content: "''",
      height: "2px",
      width: "calc(100% + 4px)", // + 2px border left/right
      display: "block",
      position: "absolute",
      left: "-2px",
      top: "-2px", // + 2px border top
    },

    "&:hover:enabled": {
      ...applyAccentBackground,
      ...applyPrimaryShadow("2px"),
      "margin-top": "2px",
      "margin-bottom": "2px",
      "text-decoration": "none",

      "&::before": {
        top: "-4px",
      },
    },

    "&:active:enabled": {
      ...applyAccentBackground,
    },
  },
  button_beforeContent: {
    ...applyBeforeMargin,
  },
  button_afterContent: {
    "margin-right": directionSwitch("", horizontalSpacing(4)),
    "margin-left": directionSwitch(horizontalSpacing(4), ""),
  },
  button_icon: {
    display: "inline-block",
    position: "relative",
    width: glyphSize,
    height: glyphSize,
    "flex-shrink": "0",
  },
  button__hasIconAndContent: {
    "& $button_icon": {
      ...applyBeforeMargin,
    },
  },
};

export default mergeDesignSystem(MSFTStyle, styles);