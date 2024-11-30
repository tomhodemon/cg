class CinematicManager
{
    constructor(app)
    {
        this.app = app;
        this.previousTimeStep = -1;

        this.nTimeSteps = 70;

        this.initialize();
    }

    initialize()
    {
        this.timeline = [];
        for (let idx = 0; idx< this.nTimeSteps; idx++)
        {
            this.timeline[idx] = [];
        }   

    }

    registerActionAtTimeStep(ts, methodName, args)
    {
        if (ts < 0 || ts >= this.nTimeSteps)
        {
            console.error('Invalid time step: ', ts);
            return;
        }  

        this.timeline[ts].push({
            methodName,
            args
        });

        console.log('Registered action at time step:', ts, '| methodName: ',methodName);
    }

    getTimeStep(t)
    {
        return Math.floor(t);
    }

    getActionAtTimeStep(t)
    {
        const ts = this.getTimeStep(t);

        if (this.previousTimeStep == ts)
        {
            return null;
        }
        
        this.previousTimeStep = ts;

        return this.timeline[ts];

    }

    update(t)
    {
        const actions = this.getActionAtTimeStep(t);

        if (actions)
        {
            actions.forEach(action => {
                this.app[action.methodName](...action.args);
            });
        }
    }
}

export default CinematicManager;