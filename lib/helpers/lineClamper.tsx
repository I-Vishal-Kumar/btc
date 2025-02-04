import React from "react";
import { Box } from "@mui/material";

interface LineClampProps {
  children: React.ReactNode;
  maxLines?: number;
  sx?: object;
  style?: React.CSSProperties;
}

const LineClamp: React.FC<LineClampProps> = ({ children, maxLines = 2, sx = {}, style = {} }) => {
  return (
    <Box
      sx={{
        display: "-webkit-box",
        WebkitLineClamp: maxLines,
        WebkitBoxOrient: "vertical",
        overflow: "hidden",
        textOverflow: "ellipsis",
        wordBreak: 'break-word',
        ...sx,
      }}
      style={style}
    >
      {children}
    </Box>
  );
};

export default LineClamp;
