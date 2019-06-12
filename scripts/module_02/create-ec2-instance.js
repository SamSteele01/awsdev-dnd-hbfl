// Imports
const AWS = require('aws-sdk');
const helpers = require('./helpers')

AWS.config.update({ region: 'us-east-1' });

// Declare local variables
const ec2 = new AWS.EC2();
const sgName = 'hamster_sg_bn2'
const keyName = 'hamster_key_bn2'

// Do all the things together
createSecurityGroup(sgName)
.then(() => {
  return createKeyPair(keyName)
})
.then((keyData) => {
  console.log('KEYDATA', keyData);
  helpers.persistKeyPair(keyData);
})
.then(() => {
  return createInstance(sgName, keyName)
})
.then((data) => {
  console.log('Created instance with:', data)
})
.catch((err) => {
  console.error('Failed to create instance with:', err)
})

// Create functions

function createSecurityGroup (sgName) {
  const params = {
    Description: sgName,
    GroupName: sgName
  }
  
  return new Promise((resolve, reject) => {
    ec2.createSecurityGroup(params, (err, data) => {
      if (err) reject(err)
      else {
        const params = {
          GroupId: data.GroupId,
          IpPermissions : [
            {
              IpProtocol: 'tcp',
              FromPort: 22,
              ToPort: 22,
              IpRanges: [
                {
                  CidrIp: '0.0.0.0/0'
                }
              ]
            },
            {
              IpProtocol: 'tcp',
              FromPort: 3000,
              ToPort: 3000,
              IpRanges: [
                {
                  CidrIp: '0.0.0.0/0'
                }
              ]
            }
          ]
        };
        
        ec2.authorizeSecurityGroupIngress(params, (err) => {
          if (err) reject(err)
          else resolve()
        })
      };
    })
  });
}

function createKeyPair (keyName) {
  const params = {
    KeyName: keyName
  }
  
  return new Promise((resolve, reject) => {
    ec2.createKeyPair(params, (err, data) => {
      if (err) reject(err)
      else {
        console.log('DATA', data);
        resolve(data);
      }
    })
  });
}

function createInstance (sgName, keyName) {
  const params = {
    ImageId: 'ami-06e8cbc3642e78040',
    InstanceType: 't2.micro',
    KeyName: keyName,
    MaxCount: 1,
    MinCount: 1,
    SecurityGroups: [
      sgName
    ],
    UserData: 'IyEvYmluL2Jhc2gKc3VkbyBhcHQtZ2V0IHVwZGF0ZQpzdWRvIGFwdC1nZXQgLXkgaW5zdGFsbCBnaXQKZ2l0IGNsb25lIGh0dHBzOi8vZ2l0aHViLmNvbS9TYW1TdGVlbGUwMS9hd3NkZXYtZG5kLWhiZmwuZ2l0IGhiZmwKY2QgaGJmbApzdWRvIG5wbSBpCnN1ZG8gbnBtIHJ1biBzdGFydAoK'
  }
  
  return new Promise((resolve, reject) => {
    ec2.runInstances(params, (err, data) => {
      if (err) reject(err)
      else resolve(data)
    })
  });
}
