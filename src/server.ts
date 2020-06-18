import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import {filterImageFromURL, deleteLocalFiles, requireAuth} from './util/util';
import urlExists from 'url-exist';
import axios from 'axios';

(async () => {

  // Init the Express application
  const app = express();

  // Set the network port
  const port = process.env.PORT || 8082;
  
  // Use the body parser middleware for post requests
  app.use(bodyParser.json());

  app.get('/filteredimage', requireAuth, async (req: Request, res: Response) => {
    const { image_url } = req.query;

    if (!image_url) {
      res.status(400).send(`'image_url' query parameter is missing in the request`);
    }

    if (!(await urlExists(image_url))) {
      res.status(422).send(`${image_url} doesn't exists`);
    }

    let filePath = '';

    try {
      filePath = await filterImageFromURL(image_url);

      if (filePath) {
        res.status(200).sendFile(filePath, () => {
          deleteLocalFiles([filePath]);
        });
      }
    } catch (e) {
      res.status(422).send(`Something went wrong while trying to process ${image_url}`);
    }
  });
  
  // Root Endpoint
  // Displays a simple message to the user
  app.get( "/", async ( req, res ) => {
    res.send("try GET /filteredimage?image_url={{}}")
  } );
  

  // Start the Server
  app.listen( port, () => {
      console.log( `server running http://localhost:${ port }` );
      console.log( `press CTRL+C to stop server` );
  } );
})();
