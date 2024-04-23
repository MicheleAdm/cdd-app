import fs from "fs";

export const getAllConfs = async (req, res) => {
  fs.readdir("./resource/confs", (err, files) => {
    if (err != null) {
      res.status(500);
      res.json({ error: err });
      return;
    }
    const confs = files.map((f) => f.replace(/.[^/.]+$/, ""));
    res.json({ confs });
  });
};

export const getConfByName = async (req, res) => {
  const name = req.param("name");

  fs.readFile(`./resource/confs/${name}.yaml`, (err, file) => {
    if (err != null) {
      res.status(500);
      res.send({ error: err });
      return;
    }
    res.type("text/yaml");
    res.send(file);
  });
};
