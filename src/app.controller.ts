import {Controller, Get} from "@nestjs/common";
import {ApiTags} from "@nestjs/swagger";
import {VersionEntity} from "./common/models/entities/version.entity";

@Controller()
@ApiTags("Misc")
export class AppController{
    @Get("version")
    getVersion(): VersionEntity{
        return {version: process.env.npm_package_version};
    }
}
