/// <refenrece path="../typings/tsd.d.ts" />

// I will need to convert wav to other formats -> use ffmpeg
import { spawn } from 'child_process';
import * as colors from 'colors';
import { IConvertorConfig, IAudio } from './AudioRecording';


//module AudioRecording {
        
    /**
     * Convert function takes an input file name and converts it to as many 
     * destination formats as possible.     
     */
    export default function convert(cfg: IConvertorConfig) {
        if(cfg === undefined) {
            console.log(colors.red("Audio Converted Error - No information passed."));
            return false;
        }

        if(!cfg.hasOwnProperty("input")) {
            console.log("Audio Converter Error - No input filename specified.");
            return false;
        }

        // prepare the process
        var name = cfg.input.substr(cfg.input.lastIndexOf("/") + 1); // trim the path
        name = name.substr(0, name.lastIndexOf(".")); // trim the extension
        
        
        var outputDir = cfg.publicRoot + cfg.outputDir || "./";
        var formats = cfg.formats || [ "mp3" ];
        var done = 0;
        var successful: Array<IAudio> = [];
        
        var debug: boolean = cfg.debug === undefined ? true : cfg.debug;
        var overrideArg = (cfg.hasOwnProperty("override") && cfg.override !== undefined)  ? (cfg.override === true ? "-y" : "-n")
                                                        : "-y"; // override files without asking is the default

        // Convert the WAV to specified file types and return all the successfuly created ones.
        for (var i in formats) {
            var ext = formats[i];
            convertTo(cfg, outputDir + "/" + name, ext, overrideArg, debug,
                
                // success
                (ext) => {
                    successful.push({
                        url:    `${cfg.outputDir}/${name}.${ext}`,
                        type:   `audio/${ext}`  
                    });
                    
                    if(++done === formats.length) {
                        // I'm done - all files have aleready been done
                        if(cfg.hasOwnProperty("success")) {
                            cfg.success(successful);
                        }
                    }
                },
            
                // fail
                (ext: string) => {                    
                    if(++done === formats.length) {
                        // I'm done - all files have aleready been done
                        if(cfg.hasOwnProperty("success")) {
                            cfg.success(successful);
                        }
                    }
                } 
            
            );
        }
    }
    
    function convertTo(cfg: IConvertorConfig, name: string, ext: string, overrideArg: string, debug: boolean,
                            success: (ext: string) => any, error: (ext: string) => any) {
                                
        var output = name + "." + ext;
        console.log(colors.gray(`Trying to convert ${cfg.input} to ${output}.`));            
            
        var ffmpeg = spawn("ffmpeg", [
            "-i", cfg.input.toString(),
            "-ac", cfg.channels.toString() || "1", // mono is default
            "-ab", cfg.quality.toString() || "64",
            "-loglevel", debug ? "verbose" : "quiet",
            overrideArg,
            output
        ]);
        
        ffmpeg.on("exit", (code) => {
            if(code === 0) {
                console.log(colors.gray(`[${colors.green("OK")}] ${ext}`));            
                success(ext);
            } else {
                console.log(colors.gray(`[${colors.red("XX")}] ${ext}`));
                error(ext);
            }
        });
        
        // define what to do, if something goes wrong
        ffmpeg.stderr.on("data", (err) => {
            console.log("FFmpeg err: %s", err);
        });
    }
//}