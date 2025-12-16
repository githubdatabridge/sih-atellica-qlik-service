export const qrsAppAccessRights = (
    appId: string,
    filter?: string,
    auditLimit = 1000
) => {
    const qDef = {
        resourceType: 'App',
        resourceRef: {
            resourceFilter: `((id eq ${appId}))`,
        },
        subjectRef: {
            resourceFilter: filter ? `((${filter}))` : '',
        },
        actions: 2,
        environmentAttributes: 'context=AppAccess;',
        subjectProperties: ['id', 'name', 'userId', 'userDirectory', 'roles'],
        auditLimit: auditLimit,
        outputObjectsPrivileges: 4,
        resourceProperties: ['name'],
    };

    return qDef;
};
