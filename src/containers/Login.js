import React, { Component } from 'react';
import { Link, withRouter } from 'react-router-dom';
import 'antd/dist/antd.css';
import Title from 'antd/lib/typography/Title';
import Text from 'antd/lib/typography/Text';
import { connect } from "react-redux";
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { Form, Input, Button, Row, Col } from 'antd';
import { loginUser } from "../actions/AuthActions";


class Login extends Component {
    componentDidMount() {
        if (this.props.auth.isAuthenticated) {
            this.props.history.push("/graph");
        }
    }

    onFinish = values => {
        console.log(values, 'loggin in');
        this.props.loginUser(values, this.props.history);
    };

    onFinishFailed = errorInfo => {
        console.log('Failed:', errorInfo);
    };
    render() {
        return (
            <Row type='flex' justify='center' align='center' >
                <Col>
                    <Title level={2}> Login </Title>
                    <Form
                        name="basic"
                        initialValues={{
                            remember: true,
                        }}
                        onFinish={this.onFinish}
                        onFinishFailed={this.onFinishFailed}
                    >
                        <Form.Item
                            name="email"
                            rules={[
                                {
                                    required: true,
                                    message: 'Please input your email!',
                                },
                            ]}
                        >
                            <Input prefix={<UserOutlined />} placeholder="Email" />
                        </Form.Item>

                        <Form.Item
                            name="password"
                            rules={[
                                {
                                    required: true,
                                    message: 'Please input your password!',
                                },
                            ]}
                        >
                            <Input.Password prefix={<LockOutlined />} placeholder="Password" />
                        </Form.Item>

                        <Form.Item>
                            <Button type="primary" htmlType="submit">
                                Submit
                        </Button>
                        </Form.Item>
                    </Form>
                    <Row type='flex' justify='start' align='top'>
                        <Col>
                            <Text strong>
                                New here? Create
                                <Link to='/signup'> an account</Link>
                            </Text>
                        </Col>
                    </Row>
                </Col>
            </Row>
        );
    }
};
const mapStateToProps = state => ({
    auth: state.auth,
    errors: state.errors
});

export default connect(
    mapStateToProps,
    { loginUser }
)(withRouter(Login));