FROM ollama/ollama

# Install curl
RUN apt-get update -y \
&& apt-get install -y curl \
&& apt-get -y autoclean

# Install nvm & node.js
ENV NODE_VERSION 20.15.1
ENV NVM_DIR /usr/local/nvm

RUN mkdir $NVM_DIR \
  && curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash \
  && \. "$NVM_DIR/nvm.sh" \
  && nvm install $NODE_VERSION \
  && nvm alias default $NODE_VERSION \
  && nvm use default

ENV NODE_PATH $NVM_DIR/v$NODE_VERSION/lib/node_modules
ENV PATH $NVM_DIR/versions/node/v$NODE_VERSION/bin:$PATH

# Install ollamazure
RUN npm i -g --cache /tmp/empty-cache ollamazure@latest

EXPOSE 4041
ENTRYPOINT [ "ollamazure" ]
CMD [ "-y" ]
