/**
 * Learn more about using TypeScript with React Navigation:
 * https://reactnavigation.org/docs/typescript/
 */

export type RootStackParamList = {
  Root: undefined;
  NotFound: undefined;
  Login: undefined;
};

export type BottomTabParamList = {
  HOME: undefined;
  QNA: undefined;
  CALENDAR: undefined;
  TabSearch: undefined;
};

export type TabParamList = {
  TabScreen: undefined;
};

export type TabTwoParamList = {
  TabTwoScreen: undefined;
};

export type paket = {
  id: number,
  name: string,
  desc: string,
  price: number,
  summary: string,
  solution: string,
  thumbnail: string,
}