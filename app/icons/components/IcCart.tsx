import * as React from "react";

function SvgIcCart(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      {...props}
    >
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M21.97 3.914c.339 0 .627.133.863.399.237.265.34.576.31.93L21.97 13.33a1.04 1.04 0 01-.376.687 1.03 1.03 0 01-.754.266H7.77l.199 1.174h11.697c.325 0 .598.118.82.354.221.237.34.503.354.798.015.295-.103.569-.354.82-.251.25-.524.362-.82.332H6.993c-.295 0-.554-.096-.775-.288-.222-.192-.34-.414-.355-.665L3.693 3.914H2.096c-.325 0-.598-.11-.82-.332a1.195 1.195 0 01-.354-.82.927.927 0 01.355-.798c.25-.206.524-.325.82-.354h2.57c.28 0 .53.088.752.266a.997.997 0 01.377.709l.244 1.329h15.928zM20.64 6.24h-4.43v2.282h4.098l.332-2.282zm-5.583 0H11.58v2.282h3.478V6.24zm0 3.456H11.58V12h3.478V9.696zM10.45 6.24H6.417l.399 2.326a.315.315 0 01.177-.044h3.456V6.24zM6.993 9.696L7.37 12h3.08V9.696H6.992zM16.21 12h3.633l.31-2.304H16.21V12zm-9.216 8.64c0-1.152.569-1.728 1.706-1.728 1.167 0 1.75.576 1.75 1.728 0 1.152-.583 1.728-1.75 1.728-1.137 0-1.706-.576-1.706-1.728zm10.39 0c0-1.152.569-1.728 1.706-1.728 1.167 0 1.75.576 1.75 1.728 0 1.152-.583 1.728-1.75 1.728-1.137 0-1.706-.576-1.706-1.728z"
      />
    </svg>
  );
}

export default SvgIcCart;