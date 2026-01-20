import { parseStringify } from "../utils";

export const signUp = async ({userData})=>{
    return parseStringify(userData);
}

export async function getLoggedInUser(){
    const user = {name:"aaaksh",email:"jj@gmail.com"}
    
    return user
}
import { api } from "../api";

export async function getReStockData() {
  try {
    const items = await api.get("/api/inventory");
    return items.filter((item) => item.quantity < 10);
  } catch (error) {
    console.error("Error fetching data:", error);
    return [];
  }
}

const getUserInfo = async () => {
  if (typeof window === "undefined") return null;
  const token = localStorage.getItem("token");
  if (!token) return null;
  try {
    const userData = await api.get("/api/auth/me");
    return userData;
  } catch (error) {
    console.error("Error fetching user details", error);
    return null;
  }
};

export default getUserInfo;

