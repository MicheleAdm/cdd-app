import fs from "fs";
import yaml from "js-yaml";
import crypto from "crypto";

export const postItemByConf = async (req, res) => {
  const name = req.body.confName;

  fs.readFile(`./resource/confs/${name}.yaml`, (err, file) => {
    if (err != null) {
      res.status(500);
      res.send({ error: err });
      return;
    }
    const request = req.body.data;

    const conf = yaml.load(file);

    const checkResult = check(conf.steps, request);

    if (checkResult.errors.length > 0) {
      res.status(400);
      res.json({ errors: checkResult.errors });
    } else {
      const responseValue = {
        basePrice: conf.basePrice,
        totalPrice: checkResult.additionalCosts.reduce(
          (a, b) => a + b,
          conf.basePrice
        ),
        data: checkResult.data,
      };
      const id = `${name}-${crypto.randomUUID()}`;
      fs.writeFile(
        `./resource/items/${id}.json`,
        JSON.stringify(responseValue),
        (err) => {
          if (err) {
            res.status(500);
            res.send({ error: err });
            return;
          } else {
            console.log(`File ${id}.json written successfully`);
          }
        }
      );
      res.status(200);
      res.json({ id });
    }
  });
};

export const getItems = async (req, res) => {
  fs.readdir("./resource/items", (err, files) => {
    if (err != null) {
      res.status(500);
      res.json({ error: err });
      return;
    }
    const items = files.map((f) => f.replace(/.[^/.]+$/, ""));
    res.json({ items });
  });
};

export const getItemById = async (req, res) => {
  const id = req.params.id;

  fs.readFile(`./resource/items/${id}.json`, (err, file) => {
    if (err != null) {
      res.status(500);
      res.send({ error: err });
      return;
    }
    res.type("application/json");
    res.send(file);
  });
};

function check(steps, request) {
  let errors = [];
  let totalAdditionalCosts = [];
  let data = {};
  for (const step of steps) {
    const requestStepData = request[step.name];
    if (step.required && !requestStepData) {
      errors.push("Required data is not present for step " + step.name);
      continue;
    }

    if (!requestStepData) {
      continue;
    }

    let value = requestStepData.value;

    if (value === undefined || value === null) {
      errors.push(
        `No value defined for step ${step.name}, which is present in request`
      );
      continue;
    }

    let displayValue;
    switch (step.selectionRule) {
      case "EXACTLY_ONE":
      case "BOOLEAN":
        const checkResult = checkValue(step, value, step.selectionRule);
        if (checkResult.error) {
          errors.push(checkResult.error);
          continue;
        }
        displayValue = checkResult.matchedValue;
        break;
      case "ZERO_OR_MORE":
        if (!(value instanceof Array)) {
          errors.push(
            `Value ${value} for step ${step.name}, which has selection rule ZERO_OR_MORE, is not an array`
          );
          continue;
        }

        displayValue = [];
        for (const v of value) {
          const checkResult = checkValue(step, v, "ZERO_OR_MORE");
          if (checkResult.error) {
            errors.push(checkResult.error);
            continue;
          }
          displayValue.push(checkResult.matchedValue);
        }

        break;
      case "AT_LEAST_ONE_COMPLEX":
        if (!(value instanceof Object)) {
          errors.push(
            `Value ${value} for step ${step.name}, which has selection rule AT_LEAST_ONE_COMPLEX, is not an object`
          );
          continue;
        }
        const res = check(step.steps, value);
        errors = [...errors, ...res.errors];
        totalAdditionalCosts = [
          ...totalAdditionalCosts,
          ...res.additionalCosts,
        ];

        const atLeastOnePresent = step.steps.some((s) =>
          res.data.hasOwnProperty(s.name)
        );

        if (!atLeastOnePresent) {
          errors.push(
            `Value for step ${step.name}, which has selection rule AT_LEAST_ONE_COMPLEX doesnt have any element`
          );
        }

        value = res.data;
        displayValue = value;
        break;
    }

    let additionalCost;

    if (step.values) {
      additionalCost = step.values.filter((v) => v.additionalCost);

      if (value instanceof Array) {
        additionalCost = additionalCost.filter((stepVal) =>
          value.includes(stepVal.value)
        );
      } else {
        additionalCost = additionalCost.filter((v) => v.value === value);
      }
      additionalCost = additionalCost.map((v) => Number(v.additionalCost));

      totalAdditionalCosts = [...totalAdditionalCosts, ...additionalCost];
    }

    const isComplex =
      "AT_LEAST_ONE_COMPLEX" === step.selectionRule ? true : false;

    data = {
      ...data,
      [step.name]: {
        value: displayValue,
        isComplex,
      },
    };
  }
  return { additionalCosts: totalAdditionalCosts, data, errors };
}

function checkValue(step, value, selectionRule) {
  if (isNaN(value)) {
    return {
      error: `Value ${value} for step ${step.name}, which has ${selectionRule} selection rule, is not a correct value`,
    };
  }
  const matchedValue = step.values.find((v) => v.value === value);
  if (!matchedValue) {
    return {
      error: `Value ${value} for step ${step.name}, which has ${selectionRule} selection rule, is not one of the expected values`,
    };
  }

  return { matchedValue };
}
