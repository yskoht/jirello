import * as At from './actionTypes';

const initialState = {
  users: {},
};

const Reducer = (state = initialState, action) => {
  switch (action.type) {
    // 
    case At.USERS_FETCH_OK: {
      const usersData = state.users.data || [];
      return {...state, users: {...action.payload, data: [...usersData, ...action.payload.data]}};
    }
    case At.USERS_FETCH_NG:
      return state;

    // 
    case At.USER_FETCH_OK: {
      const usersData = state.users.data;
      const newUsersData = usersData.map(d => {
        if (d.id == action.payload.data.id) {
          return {...d, ...action.payload.data};
        } else {
          return d;
        }
      });
      return {...state, users: {...state.users, data: newUsersData}};
    }
    case At.USER_FETCH_NG:
      return state;

    default:
      return state;
  };
}

export default Reducer;
