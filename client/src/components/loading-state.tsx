import { FC } from "react";

interface LoadingStateProps {
  message?: string;
}

const LoadingState: FC<LoadingStateProps> = ({ message = "Loading..." }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary-500 mb-4"></div>
      <p className="text-gray-600">{message}</p>
    </div>
  );
};

export default LoadingState;
