import {static as staticDir} from 'express';
import homeRouter from './home.js';
import projectsRouter  from './projects.js';
import userAuthenticationRouter from './userAuthentication.js';


const constructorMethod = (app) => {
    

    app.use('/', homeRouter);
    app.use('/login', userAuthenticationRouter)
    app.use('/projects', projectsRouter);
    app.use('/public', staticDir('public'));
    
    app.use('*', (req, res) => {
        res.status(404).render('error', { title: 'Error', error: 'Page Not Found' });
    });
}


export default constructorMethod;