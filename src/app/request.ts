import axios, {
  AxiosInstance,
  AxiosError,
  AxiosRequestConfig,
  AxiosResponse,
} from "axios";
import JSEncrypt from "jsencrypt";
import { message } from "antd";
// import { enqueueSnackbar } from "notistack";

// export const baseURL: string = "https://2904084071.eicp.vip";
export const baseURL: string = "http://127.0.0.1:8083";
// export const baseURL: string = "http://81.70.97.93";

const PUBLICKEY = import.meta.env.VITE_PUBLICKEY;
const encrypt = new JSEncrypt();

let refreshToken: string | null = localStorage.getItem("refreshToken");
let accessToken: string | null = localStorage.getItem("accessToken");
let clientId: string | null = localStorage.getItem("clientId");

const axiosInstance: AxiosInstance = axios.create({
  baseURL,
  timeout: 6000,
  withCredentials: true,
});

axiosInstance.interceptors.request.use(
  (requestConfig: AxiosRequestConfig) => {
    if (accessToken && clientId) {
      requestConfig.headers = {
        authorization: `Bearer ${accessToken}`,
        clientid: clientId,
      };
    }
    return requestConfig;
  },
  (err: AxiosError) => {
    return Promise.reject(err);
  }
);

axiosInstance.interceptors.response.use(
  async (responseConfig: AxiosResponse) => {
    if (responseConfig.data.code === 200) {
      if (
        responseConfig.config.url === "/qy/api/user/loginByUp" &&
        responseConfig.data.data.refreshToken &&
        responseConfig.data.data.accessToken &&
        responseConfig.data.data.clientId
      ) {
        refreshToken = responseConfig.data.data.refreshToken;
        accessToken = responseConfig.data.data.accessToken;
        clientId = responseConfig.data.data.clientId;

        localStorage.setItem("refreshToken", refreshToken as string);
        localStorage.setItem("accessToken", accessToken as string);
        localStorage.setItem("clientId", clientId as string);
      }
      return responseConfig;
    }
    if (responseConfig.data.code === 403 && refreshToken && clientId) {
      // refresh Token interceptor
      try {
        encrypt.setPublicKey(PUBLICKEY);

        const sign = encrypt.encrypt(`${clientId},${refreshToken}`);
        const res = await axios.post(
          `${baseURL}/qy/api/user/session/refresh`,
          {
            refresh: refreshToken,
            sign,
            clientid: clientId,
          },
          {
            headers: {
              clientid: clientId,
            },
          }
        );
        if (res.data.code === 201) {
          // enqueueSnackbar("刷新令牌成功");

          localStorage.setItem("accessToken", res.data.data.accessToken);
          localStorage.setItem("refreshToken", res.data.data.refreshToken);
          accessToken = res.data.data.accessToken;
          refreshToken = res.data.data.refreshToken;
          return axiosInstance.request(responseConfig.config);
        }
        // enqueueSnackbar("刷新令牌错误" + res.data.message);
        refreshToken = null;
        accessToken = null;
        clientId = null;
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("clientId");
        return Promise.reject(responseConfig.data);
      } catch (error: any) {
        // enqueueSnackbar("刷新令牌错误" + error.message);
        refreshToken = null;
        accessToken = null;
        clientId = null;
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("clientId");
        return Promise.reject(responseConfig.data);
      }
    }

    if (responseConfig.data.code === 401) {
      refreshToken = null;
      accessToken = null;
      clientId = null;
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("clientId");
      return Promise.reject(responseConfig.data);
    }

    // if (responseConfig.data.code === 10000) {
    //   message.error(responseConfig.data.message);
    // }

    if (responseConfig.data.code === 400) {
      message.error(responseConfig.data.message);
    }

    if (responseConfig.data.code === 202) {
      message.success(responseConfig.data.message);
    }

    return Promise.reject(responseConfig.data);
  },
  async (err: AxiosError) => {
    return Promise.reject(err);
  }
);

export default axiosInstance;
