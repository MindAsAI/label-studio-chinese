import { Button } from "../../common/Button/Button";
import { IconCopy, IconInfo, IconViewAll, IconTrash, IconSettings } from "@humansignal/icons";
import { Tooltip } from "@humansignal/ui";
import { Elem } from "../../utils/bem";
import { isSelfServe } from "../../utils/billing";
import { FF_BULK_ANNOTATION, isFF } from "../../utils/feature-flags";
import { GroundTruth } from "../CurrentEntity/GroundTruth";
import { EditingHistory } from "./HistoryActions";
import { confirm } from "../../common/Modal/Modal";
import { useCallback } from "react";

export const Actions = ({ store }) => {
  const annotationStore = store.annotationStore;
  const entity = annotationStore.selected;
  const saved = !entity.userGenerate || entity.sentUserGenerate;
  const isPrediction = entity?.type === "prediction";
  const isViewAll = annotationStore.viewingAll;
  const isBulkMode = isFF(FF_BULK_ANNOTATION) && !isSelfServe() && store.hasInterface("annotation:bulk");

  const onToggleVisibility = useCallback(() => {
    annotationStore.toggleViewingAllAnnotations();
  }, [annotationStore]);

  return (
    <Elem name="section">
      {store.hasInterface("annotations:view-all") && !isBulkMode && (
        <Tooltip title="Compare all annotations">
          <Button
            icon={<IconViewAll />}
            type="text"
            aria-label="Compare all annotations"
            onClick={() => onToggleVisibility()}
            primary={isViewAll}
            style={{
              height: 36,
              width: 36,
              padding: 0,
            }}
          />
        </Tooltip>
      )}

      {!isViewAll && !isBulkMode && store.hasInterface("ground-truth") && <GroundTruth entity={entity} />}

      {!isPrediction && !isViewAll && store.hasInterface("edit-history") && <EditingHistory entity={entity} />}

      {!isViewAll && !isBulkMode && store.hasInterface("annotations:delete") && (
        <Tooltip title="Delete annotation">
          <Button
            icon={<IconTrash />}
            look="danger"
            type="text"
            aria-label="Delete"
            onClick={() => {
              confirm({
                title: "Delete annotation",
                body: "This action cannot be undone",
                buttonLook: "destructive",
                okText: "Proceed",
                onOk: () => entity.list.deleteAnnotation(entity),
              });
            }}
            style={{
              height: 36,
              width: 36,
              padding: 0,
            }}
          />
        </Tooltip>
      )}

      {!isViewAll && !isBulkMode && store.hasInterface("annotations:add-new") && saved && (
        <Tooltip title={`Create copy of current ${entity.type}`}>
          <Button
            icon={<IconCopy style={{ width: 36, height: 36 }} />}
            size="small"
            look="ghost"
            type="text"
            aria-label="Copy Annotation"
            onClick={(ev) => {
              ev.preventDefault();

              const cs = store.annotationStore;
              const c = cs.addAnnotationFromPrediction(entity);

              // this is here because otherwise React doesn't re-render the change in the tree
              window.setTimeout(() => {
                store.annotationStore.selectAnnotation(c.id);
              }, 50);
            }}
            style={{
              height: 36,
              width: 36,
              padding: 0,
            }}
          />
        </Tooltip>
      )}

      <Button
        icon={<IconSettings />}
        type="text"
        aria-label="Settings"
        onClick={() => store.toggleSettings()}
        style={{
          height: 36,
          width: 36,
          padding: 0,
        }}
      />

      {store.description && store.hasInterface("instruction") && !isBulkMode && (
        <Button
          icon={<IconInfo style={{ width: 16, height: 16 }} />}
          primary={store.showingDescription}
          type="text"
          aria-label="Instructions"
          onClick={() => store.toggleDescription()}
          style={{
            height: 36,
            width: 36,
            padding: 0,
          }}
        />
      )}
    </Elem>
  );
};
