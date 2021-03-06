import axiosInstance from "../app/request";
import { useRecoilState } from "recoil";
import tablesState from "../state/tablesState";
import { useSnackbar } from "notistack";
import { useNavigate } from "react-router-dom";

const useTableAction = () => {
  const [tables, setTables] = useRecoilState(tablesState);

  const getTables = async () => {
    try {
      const res = await axiosInstance.get("/qy/api/tables/queryTables");

      setTables(res.data.data.tablesMsg);

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
