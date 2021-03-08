FROM node:10

# Declare variables
ENV DIR /usr/src/app
ENV USER node
ENV GROUP node
ENV UID 1000
ENV GID 1000
ENV HOME /home/$USER

# Create the app dir and
# copy all local files to that location
RUN mkdir -p $DIR
WORKDIR $DIR
COPY . $DIR

RUN ls -la

# Install deps
RUN apt-get update && apt-get upgrade -y && apt-get install \
    build-essential g++ gcc make python apt-utils -y \
    && npm install --global --quiet node-gyp npm yarn

RUN yarn install

# Use node user and take ownership of pertinent dirs
RUN chown -R $USER:$USER /usr/src
RUN chown -R $USER:$USER $HOME
# Set the current user
USER $USER

RUN ls -la

EXPOSE 9000

CMD ["yarn", "start"]
