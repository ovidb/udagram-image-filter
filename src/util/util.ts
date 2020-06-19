import fs from 'fs';
import Jimp = require('jimp');
import {NextFunction, Request, Response} from 'express';
import axios from 'axios';

// filterImageFromURL
// helper function to download, filter, and save the filtered image locally
// returns the absolute path to the local image
// INPUTS
//    inputURL: string - a publicly accessible url to an image file
// RETURNS
//    an absolute path to a filtered image locally saved file
export async function filterImageFromURL(inputURL: string): Promise<string>{
    return new Promise( async resolve => {
        const photo = await Jimp.read(inputURL);
        const outpath = '/tmp/filtered.'+Math.floor(Math.random() * 2000)+'.jpg';
        await photo
          .resize(256, 256) // resize
          .quality(60) // set JPEG quality
          .greyscale() // set greyscale
          .write(outpath, (img)=>{
              resolve(outpath);
          });
    });
}

// deleteLocalFiles
// helper function to delete files on the local disk
// useful to cleanup after tasks
// INPUTS
//    files: Array<string> an array of absolute paths to files
export async function deleteLocalFiles(files:Array<string>){
    for( let file of files) {
        fs.unlinkSync(file);
    }
}

/**
 * Middleware to handle authentication by calling the auth endpoint with a authorization header
 * @param req
 * @param res
 * @param next
 */
export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.headers || !req.headers.authorization){
    return res.status(401).send({ message: 'No authorization headers.' });
  }

  const authVerifyURL = process.env.AUTH_VERIFY_URL;

  try {
    await axios.get(authVerifyURL, {
      headers: {authorization: req.headers.authorization},
      timeout: 3000,
    });

    return next();
  } catch (e) {
    return res.status(401).send({message: 'Unauthorized'})
  }
}
