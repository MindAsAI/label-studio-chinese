import { inject } from "mobx-react";
import { IconChevronLeft } from "@humansignal/icons";
import { Block, Elem } from "../../../utils/bem";
import { Button } from "../../Common/Button/Button";
import { Icon } from "../../Common/Icon/Icon";
import { Filters } from "../Filters";
import "./FilterSidebar.scss";

const sidebarInjector = inject(({ store }) => {
  const viewsStore = store.viewsStore;

  return {
    viewsStore,
    sidebarEnabled: viewsStore?.sidebarEnabled,
    sidebarVisible: viewsStore?.sidebarVisible,
  };
});

export const FiltersSidebar = sidebarInjector(({ viewsStore, sidebarEnabled, sidebarVisible }) => {
  return sidebarEnabled && sidebarVisible ? (
    <Block name="filters-sidebar">
      <Elem name="container">
        <Elem name="header">
          <Elem name="extra">
            <Button
              type="link"
              size="small"
              about="Unpin sidebar"
              style={{ display: "inline-flex", alignItems: "center", padding: 0, width: "var(--button-height)" }}
              icon={<Icon icon={IconChevronLeft} width={24} height={24} />}
              onClick={() => viewsStore.collapseFilters()}
            />
          </Elem>
          <Elem name="title">Filters</Elem>
        </Elem>
        <Filters sidebar={true} />
      </Elem>
    </Block>
  ) : null;
});
FiltersSidebar.displayName = "FiltersSidebar";
