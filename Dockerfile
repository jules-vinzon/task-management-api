FROM node:22.16.0

ENV PORT="81"
ENV MONGO_URI="mongodb+srv://julesvinzon_db_user:tX2caszx6e6lGUlL@taskmanagement.difabae.mongodb.net/task_manager"
ENV JWT_SECRET="TSKMNGMNT_SECRET"
ENV JWT_EXPIRES_IN="1h"
ENV BCRYPT_SALT_ROUNDS="10"
ENV SECRET_KEY="5f2b9e8c7a1d4f3e9b0c6d2f8a7b3e1c"


WORKDIR /app
ADD ./package*.json /app/
ADD ./yarn.lock /app/
RUN yarn install
ADD . /app/
RUN yarn run build

CMD ["yarn", "start"]