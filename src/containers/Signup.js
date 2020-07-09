import React from 'react';
import { withRouter } from 'react-router-dom';
import 'antd/dist/antd.css';
import Title from 'antd/lib/typography/Title';
import Text from 'antd/lib/typography/Text';
import { MailOutlined, UserAddOutlined, LockOutlined } from '@ant-design/icons';
import { Form, Input, Button, Row, Col } from 'antd';
import { Link } from 'react-router-dom';
import axios from 'axios';

class Signup extends React.Component {
    constructor(props) {
        super(props);
    }

    handleSubmit = values => {
        axios.post('http://localhost:3001/api/register', values).then(res => {
            this.props.history.push('/login');
        }).catch(err => {
            alert(err);
        })
    };

    onFinishFailed = errorInfo => {
        console.log('Failed:', errorInfo);
    };

    renderFirstNameField() {
        const { form } = this.props;

        return (
            <Form.Item hasFeedback
                name='firstName'
                rules={[
                    {
                        required: true,
                        message: 'Please specify a first name',
                    },
                ]}
            >
                <Input
                    prefix={<UserAddOutlined />}
                    placeholder='First name'
                />
            </Form.Item>
        );
    }

    renderLastNameField() {
        const { form } = this.props;

        return (
            <Form.Item hasFeedback
                name='lastName'
                rules={[
                    {
                        required: true,
                        message: 'Please specify a last name',
                    },
                ]}
            >
                <Input
                    prefix={<UserAddOutlined />}
                    placeholder='Last name'
                />
            </Form.Item>
        );
    }

    renderEmailField() {
        const { form } = this.props;

        return (
            <Form.Item hasFeedback
                name='email'
                rules={[{
                    type: 'email',
                    message: 'The input is not valid E-mail!',
                }, {
                    required: true,
                    message: 'Please specify an email address',
                }]}>
                <Input
                    autoComplete='email'
                    prefix={<MailOutlined />}
                    placeholder='Email address'
                />
            </Form.Item>
        );
    }

    renderPasswordField() {
        const { form } = this.props;

        return (
            <Form.Item hasFeedback
                name='password1'
                rules={[{
                    required: true,
                    message: 'Please input your password!',
                }, {
                    validator: this.validatePassword,
                }]}
            >
                <Input.Password
                    autoComplete='new-password'
                    prefix={<LockOutlined />}
                    placeholder='Password'
                />
            </Form.Item>
        );
    }

    renderPasswordConfirmationField() {
        const { form } = this.props;

        return (
            <Form.Item hasFeedback
                name='password2'
                rules={[{
                    required: true,
                    message: 'Please confirm your password!',
                }, {
                    validator: this.validateConfirmation,
                }]}
            >
                <Input.Password
                    autoComplete='new-password'
                    prefix={<LockOutlined />}
                    placeholder='Confirm password'
                />
            </Form.Item>
        );
    }
    render() {
        return (
            <Row type='flex' justify='center' align='middle' >
                <Col>
                    <Title level={2}> Create an account </Title>
                    <Form onFinish={this.handleSubmit}>
                        <Row gutter={8}>
                            <Col span={12}>
                                {this.renderFirstNameField()}
                            </Col>
                            <Col span={12}>
                                {this.renderLastNameField()}
                            </Col>
                        </Row>
                        {this.renderEmailField()}
                        {this.renderPasswordField()}
                        {this.renderPasswordConfirmationField()}

                        <Form.Item>
                            <Button
                                type='primary'
                                htmlType='submit'
                            // loading={fetching}
                            // disabled={fetching}
                            >
                                Submit
                            </Button>
                        </Form.Item>
                    </Form>
                    <Row type='flex' justify='start' align='top'>
                        <Col>
                            <Text strong>
                                Already have an account?
                        <Link to='/login'> Login </Link>
                            </Text>
                        </Col>
                    </Row>
                </Col>
            </Row>
        );
    }
};

export default withRouter(Signup);