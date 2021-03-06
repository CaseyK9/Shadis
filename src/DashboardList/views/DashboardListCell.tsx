import manageJss, { ComponentStyles } from "@microsoft/fast-jss-manager-react";
import {
  DashboardListCellProps,
  DashboardListCellClassNameContract,
} from "./DashboardListCell.props";
import React, { useRef } from "react";
import {
  neutralLayerL2,
  DesignSystem,
  backgroundColor,
  accentFillSelected,
  neutralForegroundRest,
  applyElevation,
  ElevationMultiplier,
  applyElevatedCornerRadius,
  applyPillCornerRadius,
  neutralFillInputRest,
} from "@microsoft/fast-components-styles-msft";
import { useTranslation } from "react-i18next";
import {
  Label,
  Checkbox,
  CheckboxClassNameContract,
} from "@microsoft/fast-components-react-msft";
import { parseColorHexRGBA } from "@microsoft/fast-colors";
import { classNames } from "@microsoft/fast-web-utilities";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { FaPlayCircle } from "react-icons/fa";
import { basePath } from "../../_interceptedAxios";

const styles: ComponentStyles<DashboardListCellClassNameContract, DesignSystem> = {
  dashboardListCell: {
    background: neutralLayerL2,
    overflow: "hidden",
    ...applyElevatedCornerRadius(),
    ...applyElevation(ElevationMultiplier.e4),
    cursor: "pointer",
    "&:hover, &$dashboardListCell__checked": {
      "& $dashboardListCell_metadata": {
        transform: "translateY(0%)",
        transition: "transform .2s .1s cubic-bezier(0.1, 0.9, 0.2, 1)",
      },
      "& $dashboardListCell_checkbox": {
        opacity: "1",
      },
      "& > a::after": {
        opacity: "1",
      },
    },
    "& > a": {
      display: "block",
      "&::after": {
        content: '""',
        width: "100%",
        height: "100%",
        position: "absolute",
        top: "0",
        left: "0",
        background:
          "linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0) 55px, rgba(0,0,0,0))",
        opacity: "0",
        transition: "opacity 0.08s",
      },
    },
  },
  dashboardListCell_image: {
    width: "200px",
    objectFit: "contain",
    background: neutralLayerL2,
    userDrag: "none",
    userSelect: "none",
    opacity: "0",
    transition: "opacity .1s",
  },
  dashboardListCell_metadata: {
    position: "absolute",
    bottom: "0px",
    left: "0px",
    width: "100%",
    padding: "10px",
    boxSizing: "border-box",
    textAlign: "center",
    background: des => parseColorHexRGBA(backgroundColor(des) + "ee").toStringWebRGBA(),
    transform: "translateY(100%)",
    transition: "transform .2s cubic-bezier(0.9, 0.1, 1, 0.2)",
    outline: "none",
    cursor: "default",
    "& > label": {
      width: "100%",
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
      outline: "none",
    },
  },
  dashboardListCell_checkbox: {
    position: "absolute",
    top: "10px",
    left: "10px",
    zIndex: "2",
    opacity: "0",
    transition: "opacity 0.08s",
  },
  dashboardListCell_overlay: {
    display: "none",
    position: "absolute",
    top: "0",
    left: "0",
    width: "100%",
    height: "100%",
    boxSizing: "border-box",
    borderWidth: "2px",
    borderStyle: "solid",
    borderColor: neutralForegroundRest,
    zIndex: "1",
    outline: "none",
    ...applyElevatedCornerRadius(),
    background: (des: DesignSystem) =>
      parseColorHexRGBA(accentFillSelected(des) + "aa").toStringWebRGBA(),
  },
  dashboardListCell__checked: {
    "& $dashboardListCell_overlay": {
      display: "block",
    },
  },
  dashboardListCell_playIcon: {
    position: "absolute",
    width: "20px",
    height: "auto",
    top: "10px",
    left: "10px",
    margin: "auto",
    color: neutralFillInputRest,
    background: neutralForegroundRest,
    opacity: "0.7",
    filter: des => `drop-shadow(0px 0px 1px ${neutralFillInputRest(des)})`,
    ...applyPillCornerRadius(),
  },
};

const checkboxStyle: ComponentStyles<CheckboxClassNameContract, DesignSystem> = {
  checkbox_input: {
    borderRadius: "50%",
  },
  checkbox_stateIndicator: {},
  checkbox__checked: {
    "& $checkbox_stateIndicator": {
      "&::before": {
        backgroundSize: "17px",
        backgroundPosition: "1px 2px",
      },
    },
  },
};

const onImageLoaded: React.ReactEventHandler<HTMLImageElement> = ({ currentTarget }) => {
  currentTarget.style.opacity = "1";
  currentTarget.style.pointerEvents = "none";
};

const onImageError: React.ReactEventHandler<HTMLImageElement> = ({ currentTarget }) => {
  currentTarget.style.display = "none";
  currentTarget.style.pointerEvents = "none";
};

/**
 * Renders a cell and sets its height in the CellMeasurementCache
 */
const CellRenderer: React.FC<DashboardListCellProps> = props => {
  let { id, title, thumb_height, extension } = props.data;
  const { t } = useTranslation("dashboard");
  const cellRef = useRef<HTMLDivElement>(null);

  // We already know the thumbnail size, so we take over the work of <CellMeasurer />
  if (!props.cache.has(props.index, 0)) {
    props.cache.set(props.index, 0, 200, thumb_height);
    if (
      props.parent &&
      typeof props.parent.invalidateCellSizeAfterRender === "function"
    ) {
      props.parent.invalidateCellSizeAfterRender({
        columnIndex: 0,
        rowIndex: props.index,
      });
    }
  }

  const showPlayIcon = extension === "mp4";

  const onCheckmarkChange = (
    e: React.ChangeEvent<HTMLInputElement> & React.MouseEvent
  ) => {
    if (typeof e.currentTarget.checked !== "undefined" || props.selectMode) {
      props.onSelect(!props.selected);
    }
  };

  const onAnimationStart = () => {
    if (cellRef.current) cellRef.current.style.zIndex = "400";
  };

  const onAnimationEnd = () => {
    if (cellRef.current) cellRef.current.style.zIndex = "auto";
  };

  const shouldExecuteclick: React.MouseEventHandler<HTMLAnchorElement> = e => {
    props.selectMode && e.preventDefault();
  };

  return (
    <motion.div
      key={props.key}
      layoutId={`card-image-container-${id}`}
      className={classNames(props.managedClasses.dashboardListCell, [
        props.managedClasses.dashboardListCell__checked,
        props.selected,
      ])}
      onAnimationStart={onAnimationStart}
      onAnimationComplete={onAnimationEnd}
      onClick={onCheckmarkChange}
      ref={cellRef}
      style={{
        ...props.style,
        height: thumb_height,
      }}
    >
      {showPlayIcon && (
        <FaPlayCircle className={props.managedClasses.dashboardListCell_playIcon} />
      )}
      <Link to={`/${id}/`} onClick={shouldExecuteclick}>
        <img
          className={props.managedClasses.dashboardListCell_image}
          src={`${basePath}/${id}.thumb.jpg`}
          alt={!title || title === "untitled" ? t("untitled") : title}
          onError={onImageError}
          onLoad={onImageLoaded}
          style={{
            height: thumb_height,
          }}
        />
      </Link>
      <Checkbox
        inputId={id}
        className={props.managedClasses.dashboardListCell_checkbox}
        onChange={onCheckmarkChange as any}
        jssStyleSheet={checkboxStyle}
        checked={props.selected}
      />
      <div className={props.managedClasses.dashboardListCell_overlay} />
      {title && title !== "untitled" && (
        <footer
          className={props.managedClasses.dashboardListCell_metadata}
          tabIndex={0}
          // Make sure that small images are still selectable
          style={thumb_height < 45 ? { display: "none" } : {}}
        >
          <Label tabIndex={-1}>{title}</Label>
        </footer>
      )}
    </motion.div>
  );
};

export default manageJss(styles)(CellRenderer);
