import loadable, { LoadableComponent } from "@loadable/component";
import { FileViewProps, FileData } from "../FileView/FileView.props";
import { FullscreenLoader } from "../Loader";
import { RouteChildrenProps } from "react-router-dom";
import React, { useRef, useState, useEffect } from "react";
import axios, { getApiPath } from "../_interceptedAxios";
import { AnimatePresence, AnimateSharedLayout } from "framer-motion";
import { isLoggedIn, toast, DesignToolkitProvider } from "../_DesignSystem";
import { useTranslation } from "react-i18next";
import { History } from "history";

/**
 * Lazy-loading components
 */
const FileView: LoadableComponent<FileViewProps> = FullscreenLoader(
  import(/* webpackChunkName: "FileView" */ "../FileView/FileView")
);
const Login: LoadableComponent<{}> = loadable(() =>
  import(/* webpackChunkName: "Login" */ "../Login/Login")
);
const NotFound: LoadableComponent<{}> = loadable(() =>
  import(/* webpackChunkName: "NotFound" */ "../NotFound/NotFound")
);

// Due to the HOC It is somewhat hard to assign the proper props to it
const Dashboard: LoadableComponent<any> = loadable(() =>
  import(/* webpackChunkName: "Dashboard" */ "../Dashboard/Dashboard")
);

// Since react-toastify uses an event-based approach, lazy-loading
// the container should not cause problems
const ToastManager: LoadableComponent<any> = loadable(() =>
  import(
    /* webpackChunkName: "ToastManager" */ "../_DesignSystem/Toasts/ToastManager/ToastManager"
  )
);

// Type guards to check for data states
const isFileDataEmpty = (toDetermine: FileData): toDetermine is {} => {
  return (toDetermine as Window["fileData"]).id === undefined;
};

const isFileDataNotEmpty = (toDetermine: FileData): toDetermine is Window["fileData"] => {
  return (toDetermine as Window["fileData"]).id !== undefined;
};

/**
 * Prefetcher for <FileView/>
 *
 * Since AnimateSharedLayout expects direct children,
 * we need to fetch all necessary data
 * before the actual component is mounted.
 */
const useFilePrefetcher = (id: string, history: History<{}>) => {
  const [fileData, setFileData] = useState<FileData>(null);
  const { t } = useTranslation("common");

  useEffect(() => {
    const fetchFileData = async (id: string) => {
      try {
        const res = await axios.get(getApiPath("get"), {
          params: { id },
        });

        if (!res.data) {
          setFileData({});
        } else {
          setFileData(res.data);
        }
      } catch (err) {
        toast.error(t("error.requestFile", { id }));
        console.log(t("error.requestFile", { id }), "\n", err.message);
        history.replace("/");
      }
    };

    if (window.fileData) {
      setFileData(window.fileData);
      window.fileData = null;
      return;
    }

    if (id) fetchFileData(id);
    else setFileData(null);
  }, [history, id, t]);

  return fileData;
};

/**
 * Sets up connected animations between dashboard an view components
 * if the user is logged in and prefetches "fileData" on each "/:id" route
 */
const AnimatedRoutes: React.FC<RouteChildrenProps<{ id: string }>> = ({
  match,
  history,
}) => {
  const ViewRef = useRef<React.ComponentType<FileViewProps>>(null);
  const [viewLoaded, setViewLoaded] = useState(false);
  const fileData = useFilePrefetcher(match.params.id, history);

  /**
   * AnimateSharedLayout doesn't like stand-in components,
   * so we need to load the component ourselves.
   *
   * ViewRef is the loaded component without a loadable wrapper.
   * viewLoaded is only used to rerender the component.
   *
   * This is only needed in loggedin state, as we don't care about
   * connected animations if there is nothing to connect them to.
   */
  useEffect(() => {
    if (!ViewRef.current) {
      FileView.load().then((exported: any) => {
        ViewRef.current = exported.default;
        setViewLoaded(true);
      });
    }
  }, []);

  const is404 = !!match.params.id && fileData !== null && isFileDataEmpty(fileData);
  const isValidFile = !!match.params.id && viewLoaded && ViewRef.current && fileData;
  const isDashboardVisible = isLoggedIn && !is404;

  return (
    <AnimateSharedLayout
      type="crossfade"
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      <DesignToolkitProvider>
        {isDashboardVisible && <Dashboard key="dashboard" frozen={!!match.params.id} />}
        <AnimatePresence exitBeforeEnter>
          {isValidFile && isFileDataNotEmpty(fileData) && (
            <ViewRef.current fileData={fileData} key={match.params.id} />
          )}
          {is404 && <NotFound key="notFound" />}
          {!match.params.id && !isLoggedIn && <Login key="login" />}
        </AnimatePresence>
        <ToastManager limit={8} />
      </DesignToolkitProvider>
    </AnimateSharedLayout>
  );
};

export default AnimatedRoutes;
