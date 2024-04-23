import { Link } from "react-router-dom";

export const Configurations = ({ confs }) => {
  return (
    <div>
      <h2>Available Configurations</h2>
      {confs.map((c) => {
        return (
          <li key={c}>
            <Link to={`/confs/${c}`}>{c}</Link>
          </li>
        );
      })}
    </div>
  );
};
