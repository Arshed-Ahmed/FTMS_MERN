const Skeleton = ({ className, variant = "text", width, height }) => {
  const baseClasses = "animate-pulse bg-gray-200 dark:bg-gray-700 rounded";
  
  const variants = {
    text: "h-4 w-full",
    rect: "h-full w-full",
    circle: "rounded-full",
  };

  const style = {
    width,
    height,
  };

  return (
    <div 
      className={`${baseClasses} ${variants[variant]} ${className || ''}`} 
      style={style}
    />
  );
};

export default Skeleton;
