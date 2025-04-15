
import React from "react";
import { cn } from "@/lib/utils";

interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode;
  as?: "h1" | "h2" | "h3" | "h4";
  className?: string;
}

const Heading: React.FC<HeadingProps> = ({ 
  children, 
  as = "h1", 
  className,
  ...props 
}) => {
  const Component = as;
  
  return (
    <Component 
      className={cn(
        "tracking-tight",
        as === "h1" && "text-3xl font-bold md:text-4xl",
        as === "h2" && "text-2xl font-bold md:text-3xl",
        as === "h3" && "text-xl font-semibold md:text-2xl",
        as === "h4" && "text-lg font-semibold md:text-xl",
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
};

export default Heading;
