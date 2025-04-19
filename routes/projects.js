import {Router} from 'express';
// import {
//     getAllProjects, 
//     getProjectById, 
//     getProjectByBorough, 
//     getProjectByNeighborhood,
//     getProjectByFiscalYear,
//     getProjectByDescription,
// } from '../data/projects.js';


const router = Router();


router.route('/projects').get(async (req, res) => {
    res.render('projects', { title: 'Projects' });
});



export default router;