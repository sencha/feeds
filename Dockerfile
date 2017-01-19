FROM node:7
ENV TZ=America/Los_Angeles
RUN npm install -g nodemon
RUN useradd --user-group --create-home --shell /bin/false app
COPY . /home/app
ENV HOME=/home/app
RUN cd $HOME && chown -R app:app $HOME 
USER app
WORKDIR $HOME

RUN npm install && npm cache clear

ENV DEBUG=index
CMD [ "npm", "start" ]
