import { Link } from "react-router-dom";

export const Header = () => {
  return (
    <div className="header">
      <h1>
        <Link to="/"> Custom Guitar Store</Link>
      </h1>
    </div>
  );
};
