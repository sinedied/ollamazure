FROM ollama

RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash \
  && nvm install 20 \
  && npm i -g --cache /tmp/empty-cache ollamazure@latest
  && npm root -g > ollamazure.sh
  && echo "/ollamazure/bin/ollamazure.js \"$@\"" >> ollamazure.sh
  && chmod +x ollamazure.sh

EXPOSE 4041
ENTRYPOINT [ "./ollamazure.sh" ]
CMD []
