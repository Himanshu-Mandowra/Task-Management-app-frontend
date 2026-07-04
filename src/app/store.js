import { configureStore }
from "@reduxjs/toolkit";

import authReducer
from "../features/auth/authSlice";
import taskReducer
from "../features/task/taskSlice";
import userReducer
from "../features/user/userSlice";

export const store =
configureStore({

    reducer: {
        auth: authReducer,
        task: taskReducer,
        user: userReducer,
    }

});