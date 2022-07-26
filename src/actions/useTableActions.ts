import axiosInstance from "../app/request";
import { useRecoilState } from "recoil";
import tableState from "../state/tableState";
import { useSnackbar } from "notistack";
import { useNavigate } from "react-router-dom";
import { message } from "antd";

const useTableAction = () => {
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const [table, setTable] = useRecoilState(tableState);

  const getTables = async () => {
    try {
      const res = await axiosInstance.get("/qy/api/tables/queryTables");

      setTable(res.data.data.tablesMsg);

      return res;
    } catch (error: any) {
      return error;
    }
  };

  const openStage = async (tableNum: string, persons: string) => {
    try {
      await axiosInstance.post("/qy/api/tables/openStage", {
        tableNum,
        persons,
      });
    } catch (error: any) {
      return error;
    }
  };
  return { getTables, openStage };
};

export default useTableAction;
