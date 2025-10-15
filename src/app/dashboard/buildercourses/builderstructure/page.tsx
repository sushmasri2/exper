import { Suspense } from "react";
import BuilderStructurePage from "./builderstructure";  

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BuilderStructurePage />
    </Suspense>
  );
}
