import React, { useState, useEffect } from "react";
import { DesignSystem } from "@microsoft/fast-components-styles-msft";
import manageJss, { ComponentStyles } from "@microsoft/fast-jss-manager-react";
import { DashboardClassNameContract, DashboardProps } from "./Dashboard.props";
import { Header, toast } from "../_DesignSystem";
import { withDropzone } from "../FullscreenDropzone/FullscreenDropzone";
import axios, { getApiPath } from "../_interceptedAxios";
import { useTranslation } from "react-i18next";
import { ListDataItem, DashboardListProps } from "../DashboardList/DashboardList.props";
import { FullscreenLoader } from "../Loader";
import { LoadableComponent } from "@loadable/component";
import { DashboardEmptyProps } from "./views/DashboardEmpty.props";
import DashboardHeaderRight from "./views/DashboardHeaderRight";

const DashboardList: LoadableComponent<DashboardListProps> = FullscreenLoader(
  import("../DashboardList/DashboardList")
);

const DashboardEmpty: LoadableComponent<DashboardEmptyProps> = FullscreenLoader(
  import("./views/DashboardEmpty")
);

const styles: ComponentStyles<DashboardClassNameContract, DesignSystem> = {
  dashboard__frozen: {
    pointerEvents: "none",
    overflow: "hidden",
  },
};

const Dashboard: React.FC<DashboardProps> = props => {
  const [listData, setListData] = useState<ListDataItem[]>(null);
  const [isFrozen, setFrozenState] = useState<boolean>(false);
  const { t } = useTranslation("dashboard");

  /**
   * If the view component is loaded, this component stays in the background.
   * We halt all computations in this component as long as that is the case.
   */
  useEffect(() => {
    if (props.frozen !== isFrozen) setFrozenState(props.frozen);
  }, [isFrozen, props.frozen]);

  useEffect(() => {
    const updateFileList = async () => {
      try {
        const res = await axios.get(getApiPath("getAll"));
        setListData(res.data);
      } catch (err) {
        toast.error(t("error.listGeneric") + ":", t(err.i18n, err.message));
        console.log(`${t("error.listGeneric")}:\n`, `(${err.code}) - ${err.message}`);
      }
    };

    updateFileList();
  }, [t]);

  const onDeleteSelected = async (selection: string[]) => {
    try {
      await axios.post(getApiPath("edit"), {
        selection,
        action: "delete",
      });

      toast.success(t("selectedDeleted", { count: selection.length }));
      setListData(
        listData.filter(obj => selection.findIndex(id => id === obj.id) === -1)
      );
    } catch (err) {
      toast.error(t("error.requestGeneric") + ":", t(err.i18n, err.message));
      console.log(`${t("error.requestGeneric")}:\n`, `(${err.code}) - ${err.message}`);
    }
  };

  return (
    <div className={isFrozen ? props.managedClasses.dashboard__frozen : ""}>
      <Header position="fixed" rightSideContent={<DashboardHeaderRight />} />
      {listData === null ? null : listData.length === 0 ? (
        <DashboardEmpty />
      ) : (
        <DashboardList
          listData={listData}
          onDeleteSelected={onDeleteSelected}
          frozen={props.frozen}
        />
      )}
    </div>
  );
};

export default withDropzone(manageJss(styles)(Dashboard));
