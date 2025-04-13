import Cookies from "js-cookie";
import { nanoid } from "nanoid";

const USER_ID_COOKIE = "syncban_user_id";

let userId: string | undefined;

export function getOrCreateUserId(): string {
  if (!userId) {
    userId = Cookies.get(USER_ID_COOKIE);
    if (!userId) {
      userId = nanoid();
      Cookies.set(USER_ID_COOKIE, userId, { expires: 365 }); // Expires in 1 year
    }
  }
  return userId;
}

// Initialize user on module import
getOrCreateUserId();
