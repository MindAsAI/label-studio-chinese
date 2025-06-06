/* global Sentry */

import { createBrowserHistory } from "history";
import { render } from "react-dom";
import { Router } from "react-router-dom";
import { LEAVE_BLOCKER_KEY, leaveBlockerCallback } from "../components/LeaveBlocker/LeaveBlocker";
import { initSentry } from "../config/Sentry";
import { ApiProvider, useAPI } from "../providers/ApiProvider";
import { AppStoreProvider } from "../providers/AppStoreProvider";
import { ConfigProvider } from "../providers/ConfigProvider";
import { MultiProvider } from "../providers/MultiProvider";
import { ProjectProvider } from "../providers/ProjectProvider";
import { RoutesProvider } from "../providers/RoutesProvider";
import { DRAFT_GUARD_KEY, DraftGuard, draftGuardCallback } from "../components/DraftGuard/DraftGuard";
import { AsyncPage } from "./AsyncPage/AsyncPage";
import ErrorBoundary from "./ErrorBoundary";
import { FF_UNSAVED_CHANGES, isFF } from "../utils/feature-flags";
import { TourProvider } from "@humansignal/core";
import { ToastProvider, ToastViewport } from "@humansignal/ui";
import { QueryClient } from "@tanstack/react-query";
import { JotaiProvider, JotaiStore } from "../utils/jotai-store";
import { CurrentUserProvider } from "../providers/CurrentUser";
import { QueryClientProvider } from "@tanstack/react-query";
import { LSQueryClient } from "../utils/query-client";
import { RootPage } from "./RootPage";
import { ff } from "@humansignal/core";
import "@humansignal/ui/src/tailwind.css";
import "./App.scss";

const baseURL = new URL(APP_SETTINGS.hostname || location.origin);
export const UNBLOCK_HISTORY_MESSAGE = "UNBLOCK_HISTORY";
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

const browserHistory = createBrowserHistory({
  basename: baseURL.pathname || "/",
  // callback is an async way to confirm or decline going to another page in the context of routing. It accepts `true` or `false`
  getUserConfirmation: (message, callback) => {
    // `history.block` doesn't block events, so in the case of listeners,
    // we need to have some flag that can be checked for preventing related actions
    // `isBlocking` flag is used for this purpose
    browserHistory.isBlocking = true;
    const callbackWrapper = (result) => {
      browserHistory.isBlocking = false;
      callback(result);
      isFF(FF_UNSAVED_CHANGES) && window.postMessage({ source: "label-studio", payload: UNBLOCK_HISTORY_MESSAGE });
    };
    if (message === DRAFT_GUARD_KEY) {
      draftGuardCallback.current = callbackWrapper;
    } else if (isFF(FF_UNSAVED_CHANGES) && message === LEAVE_BLOCKER_KEY) {
      leaveBlockerCallback.current = callbackWrapper;
    } else {
      callbackWrapper(window.confirm(message));
    }
  },
});

window.LSH = browserHistory;

initSentry(browserHistory);

const App = ({ content }) => {
  return (
    <ErrorBoundary>
      <Router history={browserHistory}>
        <MultiProvider
          providers={[
            <QueryClientProvider client={LSQueryClient} key="query" />,
            <JotaiProvider key="jotai" store={JotaiStore} />,
            <AppStoreProvider key="app-store" />,
            <ToastProvider key="toast" />,
            <ApiProvider key="api" />,
            <ConfigProvider key="config" />,
            <RoutesProvider key="rotes" />,
            <ProjectProvider key="project" />,
            <CurrentUserProvider key="current-user" />,
            ff.isActive(ff.FF_PRODUCT_TOUR) && <TourProvider useAPI={useAPI} />,
          ].filter(Boolean)}
        >
          <AsyncPage>
            <DraftGuard />
            <RootPage content={content} />
            <ToastViewport />
          </AsyncPage>
        </MultiProvider>
      </Router>
    </ErrorBoundary>
  );
};

const root = document.querySelector(".app-wrapper");
const content = document.querySelector("#main-content");

render(<App content={content.innerHTML} />, root);

if (module?.hot) {
  module.hot.accept(); // Enable HMR for React components
}
