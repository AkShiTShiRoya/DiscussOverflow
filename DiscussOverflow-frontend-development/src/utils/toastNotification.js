import { toast } from "react-toastify";

export const notify = (msg, type = "default", config = {}) => {
  toast(msg, {
    type: type,
    position: "bottom-right",
    autoClose: 4000,
    ...config,
  });
};

export const notifyError = (msg, position = "bottom-right") => {
  toast(msg, {
    type: "error",
    position: position,
    autoClose: 4000,
  });
};

export const notifyWarn = (msg) => {
  console.log(msg,"debug 13")
  toast(msg, {
    type: "warning",
    position: "bottom-right",
    autoClose: 4000,
  });
};

export const notifySuccess = (msg) => {
  toast(msg, {
    type: "success",
    position: "bottom-right",
    autoClose: 4000,
  });
};

export const notifyInfo = (msg) => {
  toast(msg, {
    type: "info",
    position: "bottom-right",
    autoClose: 4000,
  });
};