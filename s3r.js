/**
 * Simple的3D渲染
 */

class Utility {

    /**
     * all expressed in byte view
     * @param from_arr
     * @param from_start_idx
     * @param to_arr
     * @param to_start_idx
     * @param length
     * @constructor
     */
    static Array_Copy(from_arr, from_start_idx, to_arr, to_start_idx, length) {

        let from = new Uint8Array(from_arr);
        let to = new Uint8Array(to_arr);
        for (let i = 0; i < length; i++) {
            to[to_start_idx + i] = from[from_start_idx + i];
        }
    }
}

class Vector4 {

    __data = new Float32Array(4);

    get data() {

        return this.__data;
    }

    copy_from(vec4) {

        this.__data[0] = vec4.data[0];
        this.__data[1] = vec4.data[1];
        this.__data[2] = vec4.data[2];
        this.__data[3] = vec4.data[3];
    }

    to_0001() {

        this.__data[0] = 0.0;
        this.__data[1] = 0.0;
        this.__data[2] = 0.0;
        this.__data[3] = 1.0;
    }
}

class Matrix4x4 {

    __data = new Float32Array(16);

    get data() {

        return this.__data;
    }

    constructor() {

        this.to_identity();
    }

    /**
     * 意为先应用矩阵in4x4再应用矩阵this
     * 形象理解为this矩阵时in4x4的父矩阵, in4x4随着父亲this的变换而变换
     * @param in4x4
     * @param out4x4
     */
    multiply(in4x4, out4x4) {

        // column major
        // x  y  z  w
        // -----------
        // 0  4  8  12
        // 1  5  9  13
        // 2  6  10 14
        // 3  7  11 15
        // -----------

        let l = this.data;//左边
        let r = in4x4.data;//右边
        let o = out4x4.data;//输出

        // l * r

        o[0] = l[0] * r[0] + l[4] * r[1] + l[8] * r[2] + l[12] * r[3];
        o[1] = l[1] * r[0] + l[5] * r[1] + l[9] * r[2] + l[13] * r[3];
        o[2] = l[2] * r[0] + l[6] * r[1] + l[10] * r[2] + l[14] * r[3];
        o[3] = l[3] * r[0] + l[7] * r[1] + l[11] * r[2] + l[15] * r[3];

        o[4] = l[0] * r[4] + l[4] * r[5] + l[8] * r[6] + l[12] * r[7];
        o[5] = l[1] * r[4] + l[5] * r[5] + l[9] * r[6] + l[13] * r[7];
        o[6] = l[2] * r[4] + l[6] * r[5] + l[10] * r[6] + l[14] * r[7];
        o[7] = l[3] * r[4] + l[7] * r[5] + l[11] * r[6] + l[15] * r[7];

        o[8] = l[0] * r[8] + l[4] * r[9] + l[8] * r[10] + l[12] * r[11];
        o[9] = l[1] * r[8] + l[5] * r[9] + l[9] * r[10] + l[13] * r[11];
        o[10] = l[2] * r[8] + l[6] * r[9] + l[10] * r[10] + l[12] * r[11];
        o[11] = l[3] * r[8] + l[7] * r[9] + l[11] * r[10] + l[15] * r[11];

        o[12] = l[0] * r[12] + l[4] * r[13] + l[8] * r[14] + l[12] * r[15];
        o[13] = l[1] * r[12] + l[5] * r[13] + l[9] * r[14] + l[13] * r[15];
        o[14] = l[2] * r[12] + l[6] * r[13] + l[10] * r[14] + l[14] * r[15];
        o[15] = l[3] * r[12] + l[7] * r[13] + l[11] * r[14] + l[15] * r[15];
    }

    to_identity() {

        this.data[0] = 1.0;
        this.data[1] = 0.0;
        this.data[2] = 0.0;
        this.data[3] = 0.0;

        this.data[4] = 0.0;
        this.data[5] = 1.0;
        this.data[6] = 0.0;
        this.data[7] = 0.0;

        this.data[8] = 0.0;
        this.data[9] = 0.0;
        this.data[10] = 1.0;
        this.data[11] = 0.0;

        this.data[12] = 0.0;
        this.data[13] = 0.0;
        this.data[14] = 0.0;
        this.data[15] = 1.0;
    }

    inverse_z() {

        this.__data[8] *= -1.0;
        this.__data[9] *= -1.0;
        this.__data[10] *= -1.0;
    }

    clear_and_init_with_orthogonal(width, height, near, far) {

        this.data[0] = 2.0 / width;
        this.data[1] = 0.0;
        this.data[2] = 0.0;
        this.data[3] = 0.0;

        this.data[4] = 0.0;
        this.data[5] = 2.0 / height;
        this.data[6] = 0.0;
        this.data[7] = 0.0;

        this.data[8] = 0.0;
        this.data[9] = 0.0;
        this.data[10] = 2.0 / Math.abs(far - near);
        this.data[11] = 0.0;

        this.data[12] = 0.0;
        this.data[13] = 0.0;
        this.data[14] = -((far + near) / 2.0 * this.data[10]);
        this.data[15] = 1.0;
    }

    clear_and_init_with_perspective(half_x, half_y, near, far) {

        this.data[0] = (2.0 * near) / (2.0 * half_x);
        this.data[1] = 0.0;
        this.data[2] = 0.0;
        this.data[3] = 0.0;

        this.data[4] = 0.0;
        this.data[5] = (2.0 * near) / (2.0 * half_y);
        this.data[6] = 0.0;
        this.data[7] = 0.0;

        this.data[8] = 0.0;
        this.data[9] = 0.0;
        this.data[10] = (far + near) / (far - near);
        this.data[11] = 1.0;

        this.data[12] = 0.0;
        this.data[13] = 0.0;
        this.data[14] = (2.0 * near * far) / (near - far);
        this.data[15] = 1.0;
    }
}

/**
 * 四元数
 */
class Quaternion {

    s = 0;
    x = 0;
    y = 0;
    z = 0;

    set(s, x, y, z) {

        this.s = s;
        this.x = x;
        this.y = y;
        this.z = z;
    }

    conjugate(q_out) {

        q_out.s = this.s;
        q_out.x = -this.x;
        q_out.y = -this.y;
        q_out.z = -this.z;
    }

    /**
     *   sasb−xaxb−yayb−zazb
     * +(saxb+sbxa+yazb−ybza)i
     * +(sayb+sbya+zaxb−zbxa)j
     * +(sazb+sbza+xayb−xbya)k
     * @param q_in
     * @param q_out
     */
    multiply(q_in, q_out) {

        let a = this;
        let b = q_in;
        let o = q_out;

        o.s = a.s * b.s - a.x * b.x - a.y * b.y - a.z * b.z;
        o.x = a.s * b.x + b.s * a.x + a.y * b.z - b.y * a.z;
        o.y = a.s * b.y + b.s * a.y + a.z * b.x - b.z * a.x;
        o.z = a.s * b.z + b.s * a.z + a.x * b.y - b.x * a.y;
    }

    normalize_pure_part() {

        let mag = Math.sqrt(Math.pow(this.x, 2.0) + Math.pow(this.y, 2.0) + Math.pow(this.z, 2.0));
        this.x /= mag;
        this.y /= mag;
        this.z /= mag;
    }

    become_point_quaternion(x, y, z) {

        this.s = 0.0;
        this.x = x;
        this.y = y;
        this.z = z;
    }

    //cosθ=s1s2+x1x2+y1y2+z1z2 for norm q
    become_rotor_quaternion(x, y, z, radians) {

        this.x = x;
        this.y = y;
        this.z = z;
        this.normalize_pure_part();

        this.s = Math.cos(radians / 2.0);
        this.x *= Math.sin(radians / 2.0);
        this.y *= Math.sin(radians / 2.0);
        this.z *= Math.sin(radians / 2.0);
    }

    static __Rotate_Cached = {

        rotor_q: new Quaternion(),
        point_q: new Quaternion(),
        rotor_q_conjugate: new Quaternion(),
        temp_q: new Quaternion(),
        result_q: new Quaternion(),
        result_vec: new Vector4()
    };

    static Rotate(rotor_q, point_q, out_q) {

        rotor_q.conjugate(Quaternion.__Rotate_Cached.rotor_q_conjugate);
        rotor_q.multiply(point_q, Quaternion.__Rotate_Cached.temp_q);
        if (out_q === undefined) {
            out_q = Quaternion.__Rotate_Cached.result_q;
        }
        Quaternion.__Rotate_Cached.temp_q.multiply(Quaternion.__Rotate_Cached.rotor_q_conjugate, out_q);
    }

    static Rotate_vector(rotor_vec, point_vec, radians, out_vec) {

        Quaternion.__Rotate_Cached.rotor_q.become_rotor_quaternion(rotor_vec.data[0], rotor_vec.data[1], rotor_vec.data[2], radians);
        Quaternion.__Rotate_Cached.point_q.become_point_quaternion(point_vec.data[0], point_vec.data[1], point_vec.data[2],);
        Quaternion.__Rotate_Cached.rotor_q.conjugate(Quaternion.__Rotate_Cached.rotor_q_conjugate);
        Quaternion.__Rotate_Cached.rotor_q.multiply(this.__Rotate_Cached.point_q, Quaternion.__Rotate_Cached.temp_q);
        if (out_vec === undefined) {
            out_vec = Quaternion.__Rotate_Cached.result_vec;
        }
        Quaternion.__Rotate_Cached.temp_q.multiply(Quaternion.__Rotate_Cached.rotor_q_conjugate, Quaternion.__Rotate_Cached.result_q);
        out_vec.data[0] = Quaternion.__Rotate_Cached.result_q.x;
        out_vec.data[1] = Quaternion.__Rotate_Cached.result_q.y;
        out_vec.data[2] = Quaternion.__Rotate_Cached.result_q.z;
    }

    static Get_Rotate_Result_Quaternion() {

        return this.__Rotate_Cached.result_q;
    }

    static Get_Rotate_Result_Vector4() {

        return this.__Rotate_Cached.result_vec;
    }

    log() {
        console.log(Math.sqrt(Math.pow(this.x, 2.0) + Math.pow(this.y, 2.0) + Math.pow(this.z, 2.0)))
    }
}

class Transform {

    __mat = new Matrix4x4();

    __rotation = {x: 0, y: 0, z: 0};
    __scale = {x: 1.0, y: 1.0, z: 1.0};
    __translation = {x: 0, y: 0, z: 0};

    __need_update = false;

    static __Update_Matrix_Cached = {
        axis_vec: new Vector4(),
        point_vec: new Vector4(),
        result_vec: new Vector4()
    };

    set_rotation(x, y, z) {

        this.__rotation.x = x;
        this.__rotation.y = y;
        this.__rotation.z = z;
        this.__need_update = true;
    }

    set_scale(x, y, z) {

        this.__scale.x = x;
        this.__scale.y = y;
        this.__scale.z = z;
        this.__need_update = true;
    }

    set_translation(x, y, z) {

        this.__translation.x = x;
        this.__translation.y = y;
        this.__translation.z = z;
        this.__need_update = true;
    }

    __update_inner_matrix() {

        if (this.__need_update) {
            //先缩放，再旋转
            this.__mat.to_identity();
            this.__mat.data[0] = this.__scale.x;
            this.__mat.data[5] = this.__scale.y;
            this.__mat.data[10] = this.__scale.z;
            //绕y旋转xz
            Transform.__Update_Matrix_Cached.axis_vec.data[0] = this.__mat.data[4];
            Transform.__Update_Matrix_Cached.axis_vec.data[1] = this.__mat.data[5];
            Transform.__Update_Matrix_Cached.axis_vec.data[2] = this.__mat.data[6];

            Transform.__Update_Matrix_Cached.point_vec.data[0] = this.__mat.data[0];
            Transform.__Update_Matrix_Cached.point_vec.data[1] = this.__mat.data[1];
            Transform.__Update_Matrix_Cached.point_vec.data[2] = this.__mat.data[2];
            Quaternion.Rotate_vector(Transform.__Update_Matrix_Cached.axis_vec, Transform.__Update_Matrix_Cached.point_vec, this.__rotation.y, Transform.__Update_Matrix_Cached.result_vec);
            this.__mat.data[0] = Transform.__Update_Matrix_Cached.result_vec.data[0];
            this.__mat.data[1] = Transform.__Update_Matrix_Cached.result_vec.data[1];
            this.__mat.data[2] = Transform.__Update_Matrix_Cached.result_vec.data[2];

            Transform.__Update_Matrix_Cached.point_vec.data[0] = this.__mat.data[8];
            Transform.__Update_Matrix_Cached.point_vec.data[1] = this.__mat.data[9];
            Transform.__Update_Matrix_Cached.point_vec.data[2] = this.__mat.data[10];
            Quaternion.Rotate_vector(Transform.__Update_Matrix_Cached.axis_vec, Transform.__Update_Matrix_Cached.point_vec, this.__rotation.y, Transform.__Update_Matrix_Cached.result_vec);
            this.__mat.data[8] = Transform.__Update_Matrix_Cached.result_vec.data[0];
            this.__mat.data[9] = Transform.__Update_Matrix_Cached.result_vec.data[1];
            this.__mat.data[10] = Transform.__Update_Matrix_Cached.result_vec.data[2];
            //绕x旋转yz
            Transform.__Update_Matrix_Cached.axis_vec.data[0] = this.__mat.data[0];
            Transform.__Update_Matrix_Cached.axis_vec.data[1] = this.__mat.data[1];
            Transform.__Update_Matrix_Cached.axis_vec.data[2] = this.__mat.data[2];

            Transform.__Update_Matrix_Cached.point_vec.data[0] = this.__mat.data[4];
            Transform.__Update_Matrix_Cached.point_vec.data[1] = this.__mat.data[5];
            Transform.__Update_Matrix_Cached.point_vec.data[2] = this.__mat.data[6];
            Quaternion.Rotate_vector(Transform.__Update_Matrix_Cached.axis_vec, Transform.__Update_Matrix_Cached.point_vec, this.__rotation.x, Transform.__Update_Matrix_Cached.result_vec);
            this.__mat.data[4] = Transform.__Update_Matrix_Cached.result_vec.data[0];
            this.__mat.data[5] = Transform.__Update_Matrix_Cached.result_vec.data[1];
            this.__mat.data[6] = Transform.__Update_Matrix_Cached.result_vec.data[2];

            Transform.__Update_Matrix_Cached.point_vec.data[0] = this.__mat.data[8];
            Transform.__Update_Matrix_Cached.point_vec.data[1] = this.__mat.data[9];
            Transform.__Update_Matrix_Cached.point_vec.data[2] = this.__mat.data[10];
            Quaternion.Rotate_vector(Transform.__Update_Matrix_Cached.axis_vec, Transform.__Update_Matrix_Cached.point_vec, this.__rotation.x, Transform.__Update_Matrix_Cached.result_vec);
            this.__mat.data[8] = Transform.__Update_Matrix_Cached.result_vec.data[0];
            this.__mat.data[9] = Transform.__Update_Matrix_Cached.result_vec.data[1];
            this.__mat.data[10] = Transform.__Update_Matrix_Cached.result_vec.data[2];
            //绕z旋转xy
            Transform.__Update_Matrix_Cached.axis_vec.data[0] = this.__mat.data[8];
            Transform.__Update_Matrix_Cached.axis_vec.data[1] = this.__mat.data[9];
            Transform.__Update_Matrix_Cached.axis_vec.data[2] = this.__mat.data[10];

            Transform.__Update_Matrix_Cached.point_vec.data[0] = this.__mat.data[0];
            Transform.__Update_Matrix_Cached.point_vec.data[1] = this.__mat.data[1];
            Transform.__Update_Matrix_Cached.point_vec.data[2] = this.__mat.data[2];
            Quaternion.Rotate_vector(Transform.__Update_Matrix_Cached.axis_vec, Transform.__Update_Matrix_Cached.point_vec, this.__rotation.z, Transform.__Update_Matrix_Cached.result_vec);
            this.__mat.data[0] = Transform.__Update_Matrix_Cached.result_vec.data[0];
            this.__mat.data[1] = Transform.__Update_Matrix_Cached.result_vec.data[1];
            this.__mat.data[2] = Transform.__Update_Matrix_Cached.result_vec.data[2];

            Transform.__Update_Matrix_Cached.point_vec.data[0] = this.__mat.data[4];
            Transform.__Update_Matrix_Cached.point_vec.data[1] = this.__mat.data[5];
            Transform.__Update_Matrix_Cached.point_vec.data[2] = this.__mat.data[6];
            Quaternion.Rotate_vector(Transform.__Update_Matrix_Cached.axis_vec, Transform.__Update_Matrix_Cached.point_vec, this.__rotation.z, Transform.__Update_Matrix_Cached.result_vec);
            this.__mat.data[4] = Transform.__Update_Matrix_Cached.result_vec.data[0];
            this.__mat.data[5] = Transform.__Update_Matrix_Cached.result_vec.data[1];
            this.__mat.data[6] = Transform.__Update_Matrix_Cached.result_vec.data[2];
            //再平移
            this.__mat.data[12] = this.__translation.x;
            this.__mat.data[13] = this.__translation.y;
            this.__mat.data[14] = this.__translation.z;
        }
    }
}

class Array_Buffer_Desc {

    __elem_type = null;
    __elem_cnt_per_stride = null;
    __whether_normalize = null;
    __stride_cnt = null;
    __offset_cnt = null;

    constructor(elem_type, elem_cnt_per_stride, whether_normalize, stride_cnt, offset_cnt) {
        this.__elem_type = elem_type;
        this.__elem_cnt_per_stride = elem_cnt_per_stride;
        this.__whether_normalize = whether_normalize;
        this.__stride_cnt = stride_cnt;
        this.__offset_cnt = offset_cnt;
    }

    format_compatible_with(desc) {

        return (this.__elem_type === desc.__elem_type
            && this.__elem_cnt_per_stride <= desc.__elem_cnt_per_stride
            && this.__stride_cnt <= desc.__stride_cnt);
    }

    format_equal_with(desc) {

        return (this.__elem_type === desc.__elem_type
            && this.__elem_cnt_per_stride <= desc.__elem_cnt_per_stride
            && this.__stride_cnt === desc.__stride_cnt);
    }

    elem_cnt_per_stride_size_in_byte() {

        return Array_Buffer_Desc.This_Type_To_Size_Bytes(this.__elem_type) * this.__elem_cnt_per_stride;
    }

    stride_size_in_byte() {

        return Array_Buffer_Desc.This_Type_To_Size_Bytes(this.__elem_type) * this.__stride_cnt;
    }

    offset_size_in_byte() {

        return Array_Buffer_Desc.This_Type_To_Size_Bytes(this.__elem_type) * this.__offset_cnt;
    }

    static get ELEM_TYPE_FLOAT() {

        return 4;
    }

    static This_Type_To_WebGL_Type(gl, this_type) {

        switch (this_type) {
            case Array_Buffer_Desc.ELEM_TYPE_FLOAT:
                return gl.FLOAT;
            default:
                return null;
        }
    }

    static This_Type_To_Size_Bytes(this_type) {

        switch (this_type) {
            case Array_Buffer_Desc.ELEM_TYPE_FLOAT:
                return 4;
            default:
                return null;
        }
    }
}

class __Mesh_Attr {

    constructor(mesh_attr_name) {

        if (arguments.length !== 1) {
            throw new Error("参数数量错误! 传入" + arguments.length + "个但是需要1个");
        }
        this.mesh_attr_name = mesh_attr_name;
    }

    mesh_attr_name = "";
    cpu_buffer = null;
    gpu_buffer = null;
    buffer_desc = null;
}

class __Mesh {

    constructor(mesh_name) {

        if (arguments.length !== 1) {
            throw new Error("参数数量错误! 传入" + arguments.length + "个但是需要1个");
        }
        this.mesh_name = mesh_name;
    }

    mesh_name = "";
    attr_map = new Map();
    vertex_cnt = 0;
}

class Batched_Ctx {

    constructor(mesh) {

        this.mesh_used = mesh;
    }

    mesh_used = null;
    go_array = [];
}

class Per_Instance_Data {

    /**
     * this is Array_Buffer.ELEM_TYPE_XXX
     * @type {Number}
     */
    __typed_buffer = null;
    __buffer_desc = null;

    constructor(typed_array, elem_type, elem_from, elem_length) {

        this.__typed_buffer = typed_array;
        this.__buffer_desc = new Array_Buffer_Desc(elem_type, elem_length, false, elem_length, elem_from);
    }
}

class Graphics_obj extends Transform {

    __s3r_belongs_to = null;
    __parent_graphics_obj = null;

    __projection_matrix = new Matrix4x4();

    id_str = "game object";

    /**
     *
     * @type {__Mesh}
     * @private
     */
    __mesh = null;
    per_instance_data_map = new Map();

    constructor(s3r_belongs_to, parent_graphics_object, mesh) {

        if (arguments.length !== 3) {
            throw new Error("参数数量错误，需要3个")
        }

        super();
        this.__s3r_belongs_to = s3r_belongs_to;
        this.__parent_graphics_obj = parent_graphics_object;
        this.__mesh = mesh;
    }

    orthogonal_projection(width, height, near, far) {

        this.__projection_matrix.clear_and_init_with_orthogonal(width, height, near, far)
    }
}

class Simple_3D_Renderer {

    __cvs = null;
    __gl = null;
    __ext_instanced = null;

    __world = new Graphics_obj(this, null, null);
    __camera = new Graphics_obj(this, this.__world, null);

    // render mesh to graphics obj
    __batched_go_map = new Map();

    __program_ctx = {
        mat_v: new Matrix4x4(),
        mat_p: new Matrix4x4(),
        mat_vp: new Matrix4x4(),
        vs: null,
        fs: null,
        attr_location_map: new Map(),
        instance_attr_location_map: new Map(),
        program: null
    }

    __static = {
        instanced_drawing_buffers: null,
        mesh_map: new Map(),
        text_mesh_map: new Map()
    };

    __cached = {
        m4x4: new Matrix4x4()
    };

    init(cvs) {

        this.__cvs = cvs;
        this.__gl = cvs.getContext(
            "webgl2",
            {
                alpha: false,
                preserveDrawingBuffer: true
            }
        );

        if (this.__gl === null) {
            throw new Error("无法获取webgl2上下文");
        }

        this.__program_ctx.vs = this.create_shader(`
              precision mediump float;
              attribute mat4 ia_mat4_m; // 到世界坐标系
              attribute mat4 ia_mat4_vp;// 到相机坐标系再到裁剪空间(GPU会自动做透视除法转换到NDC坐标系)
              attribute vec4 ia_vec4_color;
              
              attribute vec4 a_vec4_pos;

              varying vec4 iv_vec4_color;

              void main() {
              
                gl_Position = ia_mat4_vp * ia_mat4_m * a_vec4_pos;
                iv_vec4_color = ia_vec4_color;
              }
        `, this.__gl.VERTEX_SHADER);

        this.__program_ctx.fs = this.create_shader(`
              precision mediump float;
              varying vec4 iv_vec4_color;
              
              void main() {
              
                gl_FragColor = iv_vec4_color;
              }
        `, this.__gl.FRAGMENT_SHADER);

        this.__program_ctx.program = this.create_program(this.__program_ctx.vs, this.__program_ctx.fs);

        this.__program_ctx.attr_location_map["a_vec4_pos"] = {
            location: this.__gl.getAttribLocation(this.__program_ctx.program, "a_vec4_pos"),
            buffer_desc: new Array_Buffer_Desc(Array_Buffer_Desc.ELEM_TYPE_FLOAT, 4, false, 4, 0)
        };
        this.__static.instanced_drawing_buffers = new __Mesh("Instanced Drawing");

        this.__program_ctx.instance_attr_location_map["ia_mat4_m"] = {
            location: this.__gl.getAttribLocation(this.__program_ctx.program, "ia_mat4_m"),
            buffer_desc: new Array_Buffer_Desc(Array_Buffer_Desc.ELEM_TYPE_FLOAT, 16, false, 16, 0)
        };
        this.__static.instanced_drawing_buffers.attr_map["ia_mat4_m"] = new __Mesh_Attr("ia_mat4_m");
        this.__static.instanced_drawing_buffers.attr_map["ia_mat4_m"].buffer_desc = new Array_Buffer_Desc(
            Array_Buffer_Desc.ELEM_TYPE_FLOAT,
            16,
            false,
            16,
            0
        );
        this.__program_ctx.instance_attr_location_map["ia_mat4_vp"] = {
            location: this.__gl.getAttribLocation(this.__program_ctx.program, "ia_mat4_vp"),
            buffer_desc: new Array_Buffer_Desc(Array_Buffer_Desc.ELEM_TYPE_FLOAT, 16, false, 16, 0)
        };
        this.__static.instanced_drawing_buffers.attr_map["ia_mat4_vp"] = new __Mesh_Attr("ia_mat4_vp");
        this.__static.instanced_drawing_buffers.attr_map["ia_mat4_vp"].buffer_desc = new Array_Buffer_Desc(
            Array_Buffer_Desc.ELEM_TYPE_FLOAT,
            16,
            false,
            16,
            0
        );
        this.__program_ctx.instance_attr_location_map["ia_vec4_color"] = {
            location: this.__gl.getAttribLocation(this.__program_ctx.program, "ia_vec4_color"),
            buffer_desc: new Array_Buffer_Desc(Array_Buffer_Desc.ELEM_TYPE_FLOAT, 4, false, 4, 0)
        };
        this.__static.instanced_drawing_buffers.attr_map["ia_vec4_color"] = new __Mesh_Attr("ia_vec4_color");
        this.__static.instanced_drawing_buffers.attr_map["ia_vec4_color"].buffer_desc = new Array_Buffer_Desc(
            Array_Buffer_Desc.ELEM_TYPE_FLOAT,
            4,
            false,
            4,
            0
        );
    }

    is_mesh_exist(mesh_name) {

        return (this.__static.mesh_map[mesh_name] !== undefined);
    }

    is_mesh_attribute_exist(mesh_name, mesh_attribute_name) {

        if (this.is_mesh_exist(mesh_name)) {
            return (this.__static.mesh_map[mesh_name].attr_map[mesh_attribute_name] !== undefined);
        } else {
            return false;
        }
    }

    create_mesh(mesh_name, vertex_cnt) {

        this.__static.mesh_map[mesh_name] = new __Mesh(mesh_name);
        this.__static.mesh_map[mesh_name].vertex_cnt = vertex_cnt;
        this.__batched_go_map[mesh_name] = new Batched_Ctx(this.__static.mesh_map[mesh_name]);
    }

    update_mesh_attribute(mesh_name, mesh_attr_name, arr, size, type, normalize, stride, offset) {

        if (this.is_mesh_attribute_exist(mesh_name, mesh_attr_name)) {
            throw new Error("mesh attr 已存在");
        }
        if (this.is_mesh_exist(mesh_name) === false) {
            throw new Error("mesh name 不存在");
        }
        let mesh_attr = this.__static.mesh_map[mesh_name].attr_map[mesh_attr_name] = new __Mesh_Attr(mesh_attr_name);
        // need 大改
        let cpu_buffer = new Float32Array(arr.length);
        for (let i = 0; i < arr.length; i++) {
            cpu_buffer[i] = arr[i];
        }
        mesh_attr.cpu_buffer = cpu_buffer;
        mesh_attr.buffer_desc = new Array_Buffer_Desc(type, size, normalize, stride, offset);
    }

    update_mesh_to_gpu(mesh_name) {

        //获取cpu buffer
        if (this.is_mesh_exist(mesh_name) === false) {
            throw new Error("mesh name 不存在");
        }
        let mesh = this.__static.mesh_map[mesh_name];
        for (let mesh_attr_name in mesh.attr_map) {
            let mesh_attr = mesh.attr_map[mesh_attr_name];
            let original_gpu_buffer = mesh_attr.gpu_buffer;
            let new_gpu_buffer = this.__gl.createBuffer();
            if (new_gpu_buffer === null || new_gpu_buffer === undefined) {
                throw new Error("无法创建 gpu array buffer");
            }
            this.__gl.bindBuffer(this.__gl.ARRAY_BUFFER, new_gpu_buffer);
            this.__gl.bufferData(this.__gl.ARRAY_BUFFER, mesh_attr.cpu_buffer, this.__gl.STATIC_DRAW);
            mesh_attr.gpu_buffer = new_gpu_buffer;
            if (original_gpu_buffer !== null) {
                this.__gl.deleteBuffer(original_gpu_buffer);
            }
        }
    }

    add_render_obj(obj) {

        let mesh = obj.__mesh;
        if (mesh === null || mesh === undefined) {
            throw new Error("对象没有绑定的网格mesh (this situation is asserted not to happen all the time)");
        }
        let batched_ctx = this.__batched_go_map[mesh.mesh_name];
        if (batched_ctx === undefined) {
            batched_ctx = new Batched_Ctx(mesh);
            this.__batched_go_map[mesh.mesh_name] = batched_ctx;
        }
        batched_ctx.go_array.push(obj);
    }

    render(obj) {

        this.__gl.enable(this.__gl.DEPTH_TEST);
        this.__gl.depthFunc(this.__gl.LESS);
        this.__gl.viewport(0, 0, this.__cvs.width, this.__cvs.height);
        this.__gl.clearColor(0, 0, 0, 0);
        this.__gl.clear(this.__gl.COLOR_BUFFER_BIT | this.__gl.DEPTH_BUFFER_BIT);
        this.__gl.useProgram(this.__program_ctx.program);

        for (let mesh_name in this.__batched_go_map) {
            let batched_ctx = this.__batched_go_map[mesh_name];
            //计算每顶点属性
            let mesh = this.__static.mesh_map[mesh_name];
            if (mesh === undefined) {
                console.warn("mesh: " + mesh_name + "丢失");
                continue;
            }
            for (let mesh_attr_name in this.__program_ctx.attr_location_map) {
                if (mesh_attr_name in mesh.attr_map) {
                    let mesh_attr = mesh.attr_map[mesh_attr_name];
                    if (mesh_attr.buffer_desc.format_compatible_with(this.__program_ctx.attr_location_map[mesh_attr_name].buffer_desc) === false) {
                        throw new Error("每顶点缓冲区" + mesh_attr_name + "格式不兼容");
                    }
                    let location = this.__program_ctx.attr_location_map[mesh_attr_name].location;
                    this.__gl.bindBuffer(this.__gl.ARRAY_BUFFER, mesh_attr.gpu_buffer);
                    this.__gl.vertexAttribPointer(
                        location,
                        mesh_attr.buffer_desc.__elem_cnt_per_stride,
                        Array_Buffer_Desc.This_Type_To_WebGL_Type(this.__gl, mesh_attr.buffer_desc.__elem_type),
                        mesh_attr.buffer_desc.__whether_normalize,
                        mesh_attr.buffer_desc.stride_size_in_byte(),
                        mesh_attr.buffer_desc.offset_size_in_byte()
                    );
                    this.__gl.enableVertexAttribArray(location);
                }
            }
            //Compose每实例属性
            let cur_batched_obj_arr = this.__batched_go_map[mesh_name].go_array;
            for (let instanced_attr_name in this.__program_ctx.instance_attr_location_map) {
                if (instanced_attr_name in this.__static.instanced_drawing_buffers.attr_map) {
                    let instanced_attr = this.__static.instanced_drawing_buffers.attr_map[instanced_attr_name];
                    if (this.__program_ctx.instance_attr_location_map[instanced_attr_name].buffer_desc.format_equal_with(instanced_attr.buffer_desc) === false) {
                        throw new Error("每实例缓冲区" + instanced_attr + "格式不兼容");
                    }
                    //是否需要重新计算大小
                    //计算所有物体需要的总大小
                    let total_byte_size_this_array_buffer_needed = cur_batched_obj_arr.length * instanced_attr.buffer_desc.stride_size_in_byte();
                    if (instanced_attr.cpu_buffer === null || total_byte_size_this_array_buffer_needed > instanced_attr.cpu_buffer.byteLength) {
                        instanced_attr.cpu_buffer = new ArrayBuffer(Math.round(total_byte_size_this_array_buffer_needed * Math.E));
                        if (instanced_attr.gpu_buffer === null) {
                            instanced_attr.gpu_buffer = this.__gl.createBuffer();
                            if (instanced_attr.gpu_buffer === null) {
                                throw new Error("无法创建buffer");
                            }
                        }
                        this.__resize_gpu_buffer(instanced_attr.gpu_buffer, instanced_attr.cpu_buffer.byteLength, this.__gl.DYNAMIC_DRAW);
                    }
                    //遍历每个object把属性复制进去
                    cur_batched_obj_arr.forEach((e, idx) => {
                        if (instanced_attr_name in e.per_instance_data_map) {
                            if (instanced_attr.buffer_desc.format_equal_with(e.per_instance_data_map[instanced_attr_name].__buffer_desc) === false) {
                                throw new Error("GO对象" + e + "每实例属性" + instanced_attr_name + "与当前每实例缓冲区" + instanced_attr.buffer_desc + "不兼容");
                            }
                            let per_instance_data = e.per_instance_data_map[instanced_attr_name];
                            Utility.Array_Copy(
                                per_instance_data.__typed_buffer.buffer, 0,
                                instanced_attr.cpu_buffer, instanced_attr.buffer_desc.stride_size_in_byte() * idx,
                                instanced_attr.buffer_desc.stride_size_in_byte()
                            );
                        } else {
                            //这个object没有需要的每实例属性
                            throw new Error("GO对象" + e + "没有每实例属性: " + instanced_attr_name);
                        }
                    });
                    //把数据上传到cpu
                    this.upload_cpu_to_gpu(instanced_attr.cpu_buffer, 0, instanced_attr.gpu_buffer, 0, total_byte_size_this_array_buffer_needed);
                    //设置slot准备渲染
                    this.__gl.bindBuffer(this.__gl.ARRAY_BUFFER, instanced_attr.gpu_buffer);
                    let stride_cnt = instanced_attr.buffer_desc.__stride_cnt;
                    let loc = this.__program_ctx.instance_attr_location_map[instanced_attr_name].location;
                    let loop_cnt = 0;
                    let stride_in_bytes = 0;
                    //此offset不是普通的offset，是一个16的matrix分成4个slot，使用的offset
                    let offset_in_bytes = 0;
                    if (stride_cnt === 4) {
                        loop_cnt = 1;
                        stride_in_bytes = instanced_attr.buffer_desc.stride_size_in_byte();
                        offset_in_bytes = 0;
                    } else if (stride_cnt === 16) {
                        //分成4个4
                        loop_cnt = 4;
                        stride_in_bytes = instanced_attr.buffer_desc.stride_size_in_byte();
                        offset_in_bytes = stride_in_bytes / 4;
                    }
                    for (let i = 0; i < loop_cnt; i++) {
                        let loc_i = loc + i;
                        this.__gl.vertexAttribPointer(
                            loc_i,
                            4,
                            Array_Buffer_Desc.This_Type_To_WebGL_Type(this.__gl, instanced_attr.buffer_desc.__elem_type),
                            false,
                            stride_in_bytes,
                            offset_in_bytes * i,
                        );
                        // this line says this attribute only changes for each 1 instance
                        this.__gl.vertexAttribDivisor(loc_i, 1);
                        this.__gl.enableVertexAttribArray(loc_i);
                    }
                }
            }

            this.__gl.drawArraysInstanced(
                this.__gl.TRIANGLES,
                0,
                batched_ctx.mesh_used.vertex_cnt,
                batched_ctx.go_array.length,
            );
        }
        //计算每实例数据并上传
        // this.__gl
        // this.__gl.uniform4fv(this.__program_ctx.attr_location_map["fu_vec4_color"], [Math.random(), Math.random(), Math.random(), 1]);
        // let mat = new Matrix4x4();
        // mat.clear_and_init_with_orthogonal(this.__cvs.width * 2, this.__cvs.height * 2, -10000000, 20000000000);
        // mat.inverse_z();
        // let t = new Transform();
        // t.set_rotation(1, 0, obj.r);
        // t.__update_inner_matrix();
        // this.__gl.uniformMatrix4fv(this.__program_ctx.attr_location_map["au_mat4_m"], false, t.__mat.data);
        // this.__gl.uniformMatrix4fv(this.__program_ctx.attr_location_map["au_mat4_vp"], false, mat.data);
        //
        // this.__gl.drawArrays(this.__gl.TRIANGLES, 0, mesh.vertex_cnt);
    }

    create_shader(shader_code, shader_type) {

        let shader = this.__gl.createShader(shader_type);
        this.__gl.shaderSource(shader, shader_code);
        this.__gl.compileShader(shader);
        if (this.__gl.getShaderParameter(shader, this.__gl.COMPILE_STATUS)) {
            //succeeded
            return shader;
        } else {
            //failed
            console.log(this.__gl.getShaderInfoLog(shader));
            this.__gl.deleteShader(shader);
            return null;
        }
    }

    create_program(vs, fs) {

        let program = this.__gl.createProgram();
        this.__gl.attachShader(program, vs);
        this.__gl.attachShader(program, fs);
        this.__gl.linkProgram(program);
        if (this.__gl.getProgramParameter(program, this.__gl.LINK_STATUS)) {
            //success
            return program;
        } else {
            console.log(this.__gl.getProgramInfoLog(program));
            this.__gl.deleteProgram(program);
            return null;
        }
    }

    __resize_gpu_buffer(gpu_buffer, new_size_bytes, usage) {

        this.__gl.bindBuffer(this.__gl.ARRAY_BUFFER, gpu_buffer);
        this.__gl.bufferData(this.__gl.ARRAY_BUFFER, new_size_bytes, usage);
    }

    /**
     * all arguments express in bytes
     * @param cpu_buffer
     * @param cpu_from
     * @param gpu_buffer
     * @param gpu_from
     * @param length
     */
    upload_cpu_to_gpu(cpu_buffer, cpu_from, gpu_buffer, gpu_from, length) {

        this.__gl.bindBuffer(this.__gl.ARRAY_BUFFER, gpu_buffer);
        let a = new Uint8Array(cpu_buffer);
        this.__gl.bufferSubData(this.__gl.ARRAY_BUFFER, gpu_from, a, cpu_from, length);
    }
}
