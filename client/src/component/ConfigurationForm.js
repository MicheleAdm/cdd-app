import { useParams, useNavigate } from "react-router-dom";
import yaml from "js-yaml";
import { useEffect, useState } from "react";
import { getConfByName } from "../api/confsApis";
import { createItem } from "../api/itemApis";

export const ConfigurationForm = () => {
  const { name } = useParams();
  const [conf, setConf] = useState({ err: null, data: null });
  const [input, setInput] = useState({});
  const [errorMessages, setErrorMessages] = useState(null);
  const navigate = useNavigate();

  const getConf = async () => {
    let res;
    try {
      res = await getConfByName(name);
    } catch (err) {
      setConf({ err: `Error while retrieve conf with name ${name}` });
      return;
    }
    const confData = yaml.load(res.data);
    setConf({ data: confData });

    const fill = (steps) => {
      let initialInput = input;
      for (const step of steps) {
        if (step.steps) {
          initialInput = {
            ...initialInput,
            [step.name]: { value: fill(step.steps) },
          };
        }

        if (!step.values) {
          continue;
        }
        const preselectedValue = step.values.find((v) => v.preselected);

        if (preselectedValue) {
          initialInput = {
            ...initialInput,
            [step.name]: { value: preselectedValue.value },
          };
        }
      }
      return initialInput;
    };

    setInput(fill(confData.steps));
  };

  useEffect(() => {
    getConf();
  }, []);

  if (!conf.err && !conf.data) {
    return <p>Loading form...</p>;
  }

  if (conf.err) {
    return <p>{conf.err}</p>;
  }

  console.log(input);
  console.log(errorMessages);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const request = { confName: name, data: input };
    console.log("sending request", request);
    try {
      const creationRes = await createItem(request);
      console.log(`Created item with id ${creationRes.data.id}`);
      navigate(`/items/${creationRes.data.id}`);
    } catch (err) {
      setErrorMessages(err.response.data.errors);
    }
  };

  return (
    <form className="item-container">
      <h3>{name}</h3>
      {errorMessages
        ? errorMessages.map((e) => (
            <p key={e} style={{ color: "red" }}>
              {e}
            </p>
          ))
        : null}
      {conf.data.steps.map((s) => {
        return (
          <FormInputWrapper
            key={s.name}
            s={s}
            explicitNoneSelect={!s.required}
            setInput={setInput}
            input={input}
          />
        );
      })}
      <p style={{ color: "red", marginTop: "50px" }}>* Required Field</p>
      <button type="submit" onClick={handleSubmit}>
        Submit
      </button>
    </form>
  );
};

const FormInputWrapper = ({
  s,
  explicitNoneSelect,
  setInput,
  input,
  parentStep,
}) => {
  return (
    <ul key={s.name}>
      <label htmlFor={s.name}>
        {s.name} {s.required ? <span style={{ color: "red" }}>*</span> : null}
      </label>
      <FormInput
        step={s}
        explicitNoneSelect={explicitNoneSelect}
        setInput={setInput}
        input={input}
        parentStep={parentStep}
      />
    </ul>
  );
};

const FormInput = ({
  step,
  explicitNoneSelect,
  setInput,
  input,
  parentStep,
}) => {
  switch (step.selectionRule) {
    case "EXACTLY_ONE":
      return (
        <select
          name={step.name}
          key={step.name}
          onChange={(e) => {
            //This part could be done better
            if (!parentStep) {
              setInput({
                ...input,
                [step.name]:
                  e.target.value !== "-1"
                    ? { value: Number(e.target.value) }
                    : undefined,
              });
            } else {
              setInput({
                ...input,
                [parentStep.name]: {
                  value: {
                    ...input[parentStep.name].value,
                    [step.name]:
                      e.target.value !== "-1"
                        ? { value: Number(e.target.value) }
                        : undefined,
                  },
                },
              });
            }
          }}
        >
          {explicitNoneSelect ? <option value={-1}>-- None --</option> : null}
          {step.values.map((v) => {
            return (
              <option key={v.value} value={v.value} selected={v.preselected}>
                {v.description}
              </option>
            );
          })}
        </select>
      );
    case "BOOLEAN":
      return (
        <input
          key={step.name}
          type="checkbox"
          name={step.name}
          checked={input[step.name] && input[step.name].value === 1}
          onChange={(e) => {
            setInput({
              ...input,
              [step.name]: { value: e.target.checked ? 1 : 0 },
            });
          }}
        />
      );
    case "AT_LEAST_ONE_COMPLEX":
      return step.steps.map((s) => {
        return (
          <FormInputWrapper
            key={s.name}
            s={s}
            explicitNoneSelect={true}
            setInput={setInput}
            input={input}
            parentStep={step}
          />
        );
      });

    case "ZERO_OR_MORE":
      return (
        <ul>
          {step.values.map((v) => {
            return (
              <div key={v.value}>
                <label htmlFor={v.description}>{v.description}</label>
                <input
                  value={v.value}
                  type="checkbox"
                  name={v.description}
                  onChange={(e) => {
                    let arr;
                    if (!input[step.name] || !input[step.name].value) {
                      arr = [];
                    } else {
                      arr = input[step.name].value;
                    }
                    const checked = e.target.checked;
                    if (checked) {
                      arr.push(Number(e.target.value));
                    } else {
                      arr = arr.filter((i) => i !== Number(e.target.value));
                    }
                    setInput({
                      ...input,
                      [step.name]: { value: arr },
                    });
                  }}
                />
              </div>
            );
          })}
        </ul>
      );
  }
};
