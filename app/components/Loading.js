import React from "react";
import Image from "next/image";
const Loading = () => {
  return (
    <div className="loading w-full h-full flex items-center justify-center">
     <Image
      src="/images/spinner.svg"
      width={50}
      height={50}
      className="w-24 h-24"
     ></Image>
    </div>
  );
};

export default Loading;
