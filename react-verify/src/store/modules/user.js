import { createSlice } from "@reduxjs/toolkit";
import { loginSuperAPI, getSuperInfoAPI } from "@/lib/appwrite.ts";

const userStore = createSlice({
  name: "user",
  initialState: {
    userInfo: JSON.parse(localStorage.getItem("super_user")) || null,
  },
  reducers: {
    setUserInfo(state, action) {
      state.userInfo = action.payload;
      localStorage.setItem("super_user", JSON.stringify(action.payload));
    },
    clearUserInfo(state) {
      state.userInfo = null;
      localStorage.removeItem("super_user");
    },
  },
});

const { setUserInfo, clearUserInfo } = userStore.actions;

const userReducer = userStore.reducer;

// 登录异步方法
const fetchLogin = (credentials) => {
  return async (dispatch) => {
    try {
      const userData = await loginSuperAPI(
        credentials.super_name,
        credentials.super_password
      );
      dispatch(setUserInfo(userData));
    } catch (error) {
      throw new Error("登录失败：" + error.message);
    }
  };
};

// 获取用户信息
const fetchUserInfo = () => {
  return async (dispatch, getState) => {
    const { $id } = getState().user.userInfo;
    const userData = await getSuperInfoAPI($id);
    dispatch(setUserInfo(userData));
  };
};

export { fetchLogin, fetchUserInfo, clearUserInfo };
export default userReducer;
