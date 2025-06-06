import { useCallback, useContext, useEffect, useState } from "react";
import { useAPI } from "../../../providers/ApiProvider";
import { Select } from "../../../components/Form";
import { ProjectContext } from "../../../providers/ProjectProvider";

export const ModelVersionSelector = ({
  name = "model_version",
  valueName = "model_version",
  apiName = "projectModelVersions",
  ...props
}) => {
  const api = useAPI();
  const { project } = useContext(ProjectContext);
  const [loading, setLoading] = useState(true);
  const [versions, setVersions] = useState([]);
  const [models, setModels] = useState([]);
  const [version, setVersion] = useState(null);
  const [placeholder, setPlaceholder] = useState("");

  useEffect(() => {
    setVersion(project?.[valueName] || null);
  }, [project?.[valueName], versions]);

  const fetchMLVersions = useCallback(async () => {
    const pk = project?.id;

    if (!pk) return;

    const modelVersions = await api.callApi(apiName, {
      params: {
        pk,
        extended: true,
        include_live_models: true,
      },
    });

    if (modelVersions?.live?.length > 0) {
      const liveModels = modelVersions.live.map((item) => {
        const label = `${item.title} (${item.readable_state})`;

        return {
          group: "Models",
          value: item.title,
          label,
        };
      });

      setModels(liveModels);
    }

    if (modelVersions?.static?.length > 0) {
      const staticModels = modelVersions.static.map((item) => {
        const label = `${item.model_version} (${item.count} predictions)`;

        return {
          group: "Predictions",
          value: item.model_version,
          label,
        };
      });

      setVersions(staticModels);
    }

    if (!modelVersions?.static?.length && !modelVersions?.live?.length) {
      setPlaceholder("No model or predictions available");
    }

    setLoading(false);
  }, [project?.id, apiName]);

  useEffect(() => {
    fetchMLVersions();
  }, [fetchMLVersions]);

  return (
    <div>
      <label>请选择要使用的预测结果或模型：</label>
      <div style={{ display: "flex", alignItems: "center", width: 400 }}>
        <div style={{ flex: 1, paddingRight: 16 }}>
          <Select
            name={name}
            disabled={!versions.length && !models.length}
            value={version}
            onChange={setVersion}
            options={[...models, ...versions]}
            placeholder={placeholder || "请选择模型或预测结果"}
            isInProgress={loading}
            {...props}
          />
        </div>
      </div>
    </div>
  );
};
