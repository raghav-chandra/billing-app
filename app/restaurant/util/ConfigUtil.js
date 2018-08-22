export function getDetails (configs) {
    let config= {};
    if(configs && configs.length) {
        configs.forEach(conf=>{
            config.company = conf.ConfigGroup === 'FIRM' && conf.Config === 'NAME' ? conf.Value:config.company;
            config.companyAddress1 = conf.ConfigGroup === 'FIRM' && conf.Config === 'ADDRESS1' ? conf.Value:config.companyAddress1;
            config.companyAddress2 = conf.ConfigGroup === 'FIRM' && conf.Config === 'ADDRESS2' ? conf.Value:config.companyAddress2;
            config.companyLandLine1 = conf.ConfigGroup === 'FIRM' && conf.Config === 'LANDLINE1' ? conf.Value:config.companyLandLine1;
            config.companyLandLine2 = conf.ConfigGroup === 'FIRM' && conf.Config === 'LANDLINE2' ? conf.Value:config.companyLandLine2;
            config.companyMobile1 = conf.ConfigGroup === 'FIRM' && conf.Config === 'MOBILE1' ? conf.Value:config.companyMobile1;
            config.companyMobile2 = conf.ConfigGroup === 'FIRM' && conf.Config === 'MOBILE2' ? conf.Value:config.companyMobile2;

            config.companyGSTIN = conf.ConfigGroup === 'FIRM' && conf.Config === 'GSTIN' ? conf.Value:config.companyGSTIN;
            config.defaultGST = conf.ConfigGroup === 'FIRM' && conf.Config === 'DEFAULT_GST' ? conf.Value:config.defaultGST;
        });
    }
    return config;
}