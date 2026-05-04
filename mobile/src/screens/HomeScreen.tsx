import type { ReactElement } from "react";
import { ExploreScreen } from "./ExploreScreen";

/** Same UI as the “Main” tab; kept for any imports still named `HomeScreen`. */
export function HomeScreen(): ReactElement {
  return <ExploreScreen />;
}
