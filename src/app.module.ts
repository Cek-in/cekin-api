import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { FirebaseAdminModule } from "@aginix/nestjs-firebase-admin";
import * as admin from "firebase-admin";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { GraphQLModule } from "@nestjs/graphql";
import { GQLModule } from "./graphql/graphql.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: "postgres",
      ssl: {
        rejectUnauthorized: false,
      },
      host: process.env.DB_HOST,
      port: 5432,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [],
      //synchronize: true,
    }),
    GraphQLModule.forRoot({
      debug: false,
      typePaths: ["./**/*.graphql"],
      // definitions: {
      //   path: join(process.cwd(), "src/graphql/graphql.ts"),
      // },
      // playground: true,
      introspection: true,
      plugins: [],
    }),
    GQLModule,
    FirebaseAdminModule.forRootAsync({
      useFactory: () => ({
        credential: admin.credential.cert({
          projectId: process.env.FB_PROJECT_ID,
          privateKey: process.env.FB_PRIVATE_KEY.replace(/\\n/g, "\n"),
          clientEmail: process.env.FB_CLIENT_EMAIL,
        }),
      }),
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
